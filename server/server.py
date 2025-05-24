
# Standard Library
import sys
import signal
import re
import string
import atexit
import logging
from datetime import datetime, timedelta
from collections import defaultdict

# Third-party Libraries
import numpy as np
import pytz
import pickle
from sentence_transformers import util
from flask import Flask, request, jsonify, Response
from flask_cors import CORS, cross_origin
from flask_caching import Cache

# Firebase Admin SDK
import firebase_admin
from firebase_admin import auth, credentials, initialize_app, firestore

# Initialize Flask app
app = Flask(__name__)
CORS(app)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Firebase
try:
    cred = credentials.Certificate(r"healthcare\app\firebase\service_account_key.json")  # Update with your correct path
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://healthcare-website-9afe5.firebaseio.com'
    })
    db = firestore.client()
    tz = pytz.timezone('Asia/Karachi')
    test_ref = db.collection('connection_tests').document('health_check')
    test_ref.set({'last_check': datetime.now(tz)})
    logger.info("✅ Firebase connected successfully")
except Exception as e:
    logger.error(f"❌ Firebase connection failed: {str(e)}")
    db = None
    raise

# Global state
server_running = True

# --- Helper Functions ---
def clean_text(text):
    """Sanitize and normalize text input"""
    if not isinstance(text, str):
        return ""
        
    text = text.lower()
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'<.*?>+', '', text)
    text = re.sub(f'[{re.escape(string.punctuation)}]', ' ', text)
    text = re.sub(r'\n', ' ', text)
    text = re.sub(r'\w*\d\w*', ' ', text)
    return text.strip()

def format_timestamp(timestamp):
    """Standardize timestamp formatting"""
    if not timestamp:
        return ""
    try:
        if isinstance(timestamp, str):
            dt = datetime.fromisoformat(timestamp)
        else:  # Firestore Timestamp
            dt = timestamp
        return dt.astimezone(tz).strftime("%Y-%m-%d %H:%M")
    except Exception:
        return ""

# --- Model Loading ---
MODELS = {}
try:
    # Load disease prediction models
    with open('server\disease_material\disease_model.pkl', 'rb') as f:
        MODELS['disease'] = {
            'model': pickle.load(f),
            'vectorizer': pickle.load(open('server\disease_material\disease_vectorizer.pkl', 'rb')),
            'le': pickle.load(open('server\disease_material\disease_le.pkl', 'rb')),
            'label_encoders': pickle.load(open('server\disease_material\disease_label_encoders.pkl', 'rb'))
        }
    
    # Load mental health models
    with open('server\mental_material\dep_model.pkl', 'rb') as f:
        dep_model = pickle.load(f)
    dep_vectorizer = pickle.load(open('server\mental_material\dep_vectorizer.pkl', 'rb'))
    dep_le = pickle.load(open('server\mental_material\dep_le.pkl', 'rb'))

    # Load medical assistance model
    with open('server\medical_assistance_material\model_embeddings.pkl', 'rb') as f:
        data = pickle.load(f)
        model = data['model']
        question_embeddings = data['embeddings']
        questions = data['questions']
        answers = data['answers']
        qtype = data['qtype']
    
    logger.info("✅ Models loaded successfully")
except Exception as e:
    logger.error(f"❌ Model loading failed: {str(e)}")
    MODELS = {}

# --- API Routes ---
@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint for service health monitoring"""
    try:
        if not db:
            raise Exception("Firebase not connected")
            
        test_ref = db.collection('connection_tests').document('health_check')
        test_ref.set({'timestamp': datetime.now(tz)})
        
        if not test_ref.get().exists:
            raise Exception("Firebase write succeeded but read failed")
            
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now(tz).isoformat(),
            'models_loaded': list(MODELS.keys())
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(tz).isoformat()
        }), 500

@app.route('/disease', methods=['POST'])
def predict_disease():
    """Predict disease from symptoms"""
    try:
        data = request.get_json()
        if not data or 'symptoms' not in data:
            return jsonify({'error': 'Missing symptoms data'}), 400
            
        symptoms = clean_text(data['symptoms'])
        if not symptoms:
            return jsonify({'error': 'Invalid symptoms input'}), 400
            
        # Make prediction
        X_vec = MODELS['disease']['vectorizer'].transform([symptoms])
        pred = MODELS['disease']['model'].predict(X_vec)
        
        # Format results
        result = {}
        for i, col_name in enumerate(['disease', 'cures', 'doctor', 'risk level']):
            result[col_name] = clean_text(
                MODELS['disease']['label_encoders'][col_name].inverse_transform([pred[0][i]])[0]
            ).capitalize()

        if result['disease'].lower() == 'epilepsy':
            return jsonify({'error': 'Please provide more specific symptoms'}), 400
            
        return jsonify({'prediction': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/mental_health', methods=['POST'])
def predict_mental_health():
    """Predict mental health condition"""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Missing message data'}), 400
            
        thoughts = clean_text(data['message'])
        X_vec = dep_vectorizer.transform([thoughts])
        pred = dep_model.predict(X_vec)
        result = dep_le.inverse_transform(pred)

        return jsonify({'reply': result[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_answer(user_query, top_n=3):
    """Get answer from medical assistance model"""
    user_query = user_query.lower().strip()
    query_embedding = model.encode(user_query, convert_to_tensor=True)

    scores = util.pytorch_cos_sim(query_embedding, question_embeddings)[0]
    top_results = scores.topk(top_n)

    top_indices = top_results.indices.tolist()
    results = []

    for idx in top_indices:
        results.append({
            'Answer': answers[idx],
            'Category': qtype[idx]
        })

    return results

@app.route('/medical_assistance', methods=['POST'])
@cross_origin()
def get_answer_route():
    """Endpoint for medical assistance"""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Missing "query" in request body'}), 400

        user_query = data['query']
        results = get_answer(user_query, top_n=1)

        if results:
            return jsonify({'reply': results[0]})
        else:
            return jsonify({'reply': 'Sorry, I could not find relevant information based on your query.'})
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# --- Analytics Functions ---
def get_enhanced_disease_analytics(start_date, end_date=None, gender='All', operation='GET'):
    """Get disease analytics data"""
    trends = defaultdict(int)
    categories = defaultdict(int)
    risk_levels = defaultdict(int)
    doctors = defaultdict(int)
    medicine = defaultdict(int)
    disease_data = defaultdict(dict)
    last_doc_disease = None
    user_lookup = defaultdict(dict)
    last_doc_registrations = None

    if operation == 'POST':
        if end_date is None:
            end_date = datetime.now(pytz.UTC)
        if gender != 'All':
            while True:
                queryy = db.collection('registrations').where('gender', '==', gender.lower()).limit(500)
                if last_doc_registrations:
                    queryy = queryy.start_after(last_doc_registrations)
                docss = list(queryy.stream())
                if not docss:
                    break
                user_lookup.update({docu.to_dict().get('name'): docu.to_dict() for docu in docss})
                last_doc_registrations = docss[-1] if docss else None
            logger.info(f"Loaded {len(user_lookup)} users from registrations for gender: {gender}")

    while True:
        query = db.collection('Disease Predictor').where('date', '>=', start_date).limit(20)
        if end_date:
            query = query.where('date', '<=', end_date)
        if gender != 'All' and operation == 'POST':
            query = query.where('gender', '==', gender.lower().capitalize())
        query = query.order_by('date').limit(500)
        if last_doc_disease:
            query = query.start_after(last_doc_disease)
        docs = list(query.stream())
        if not docs:
            break
        for doc in docs:
            data = doc.to_dict()
            username = data.get('userName')
            if gender != 'All' and operation == 'POST' and username not in user_lookup:
                continue
            date_obj = data.get('date')
            if not date_obj:
                continue
            day = (date_obj.astimezone(tz).strftime('%Y-%m-%d') if isinstance(date_obj, datetime)
                   else datetime.fromisoformat(date_obj.replace('Z', '+00:00')).astimezone(tz).strftime('%Y-%m-%d')
                   if isinstance(date_obj, str) else None)
            if not day:
                continue
            disease_data[doc.id] = data
            trends[day] += 1
            categories[data.get('disease', 'Unknown')] += 1
            risk_levels[data.get('riskLevel', 'High')] += 1
            doctors[data.get('doctor', 'Not Prescribed')] += 1
            medicine[data.get('cures', 'Not Prescribed')] += 1
        last_doc_disease = docs[-1] if docs else None

    columns = ['date', 'cures', 'doctor', 'disease', 'userName', 'riskLevel', 'inputDescription', 'serialNo']
    structured_data = [{column: data.get(column, None) for column in columns} for data in disease_data.values()]

    return {
        'structured_data': structured_data,
        'trends': [{"date": day, "count": count} for day, count in sorted(trends.items(), key=lambda x: x[0])],
        'categories': [{"name": name, "count": count} for name, count in sorted(categories.items(), key=lambda x: (-x[1], x[0]))[:10]],
        'risk_levels': [{"name": name, "value": count} for name, count in risk_levels.items()],
        'doctors': [{"name": name, "count": count} for name, count in doctors.items()],
        'cures': [{"name": name, "count": count} for name, count in medicine.items()]
    }

def get_mental_health_analytics(start_date, end_date=None, gender='All', operation='GET'):
    if start_date is None:
        start_date = datetime.fromisoformat("2025-04-17T00:00:00+00:00")
    if end_date is None:
        end_date = datetime.now(pytz.UTC)

    trends = defaultdict(int)
    mental_data = {}
    distribution = {"Suicidal": 0, "Depressed": 0, "Anxiety": 0, "Normal": 0, "Other": 0}
    user_lookup = {}
    last_doc_mental = None  # Separate last_doc for Mental Health Analyzer
    last_doc_registrations = None  # Separate last_doc for registrations

    if gender != 'All' or operation == 'POST':
        while True:
            queryy = db.collection('registrations').where('gender', '==', gender.lower()).limit(500)
            if last_doc_registrations:
                queryy = queryy.start_after(last_doc_registrations)
            docss = list(queryy.stream())
            if not docss:
                break
            user_lookup.update({docu.to_dict().get('name'): docu.to_dict() for docu in docss})
            last_doc_registrations = docss[-1] if docss else None
        logger.info(f"Loaded {len(user_lookup)} users from registrations for gender: {gender}")

    while True:
        query = db.collection('Mental Health Analyzer').order_by('date', direction=firestore.Query.DESCENDING).limit(20)
        if operation == 'POST':
            query = query.where('date', '>=', start_date).where('date', '<=', end_date)
        query = query.limit(500)
        if last_doc_mental:
            query = query.start_after(last_doc_mental)
        docs = list(query.stream())
        if not docs:
            break
        for doc in docs:
            data = doc.to_dict()
            username = data.get('userName')
            if gender != 'All' and username not in user_lookup:
                continue
            date_obj = data.get('date')
            if not date_obj:
                continue
            try:
                day = (date_obj.astimezone(tz).strftime('%Y-%m-%d') if isinstance(date_obj, datetime)
                       else datetime.fromisoformat(date_obj.replace('Z', '+00:00')).astimezone(tz).strftime('%Y-%m-%d')
                       if isinstance(date_obj, str) else None)
                if not day:
                    continue
                mental_data[doc.id] = data
                trends[day] += 1
                condition = str(data.get('condition', '')).lower().strip()
                if 'suicidal' in condition or 'suicide' in condition:
                    distribution["Suicidal"] += 1
                elif 'depress' in condition or 'depression' in condition:
                    distribution["Depressed"] += 1
                elif 'Anxiety' in condition or 'anxiety' in condition:
                    distribution["Anxiety"] += 1
                elif 'normal' in condition:
                    distribution["Normal"] += 1
                else:
                    distribution["Other"] += 1
            except Exception as e:
                logger.warning(f"Invalid date format in document {doc.id}: {str(e)}")
                continue
        last_doc_mental = docs[-1] if docs else None

    columns = ['userName', 'date', 'userMessage', 'botResponse', 'serialNo']
    structured_data = [{column: data.get(column, None) for column in columns} for data in mental_data.values()]

    return {
        'structured_data': structured_data,
        'trends': [{"date": day, "count": count} for day, count in sorted(trends.items())],
        'distribution': [{"label": k, "value": v} for k, v in distribution.items()]
    }

def get_medical_bot_analytics(start_date, end_date=None, gender='All',operation='GET'):
    trends = defaultdict(int)
    categories = defaultdict(int)
    medical_assist_data = {}  # Collect all data unfiltered
    user_lookup = {}
    last_doc_bot = None
    last_doc_registrations = None
    valid_categories = {
            'susceptibility', 'symptoms', 'exams and tests', 'treatment',
            'prevention', 'information', 'frequency', 'complications',
            'causes', 'research', 'outlook', 'considerations', 'inheritance',
            'stages', 'genetic changes', 'support groups'
        }
    try:
        # Load user lookup based on gender for filtering trends and categories
        if gender != 'All' or operation == 'POST':
            while True:
                queryy = db.collection('registrations').where('gender', '==', gender.lower()).limit(500)
                if last_doc_registrations:
                    queryy = queryy.start_after(last_doc_registrations)
                docss = list(queryy.stream())
                if not docss:
                    break
                user_lookup.update({docu.to_dict().get('name'): docu.to_dict() for docu in docss})
                last_doc_registrations = docss[-1] if docss else None
            logger.info(f"Loaded {len(user_lookup)} users from registrations for gender: {gender}")

        # Fetch all medical assistance data without date filtering
        while True:
            print('Fetching batch of documents...')
            query = db.collection('Medical Assistance Bot').order_by('date', direction=firestore.Query.DESCENDING).limit(20)
            if last_doc_bot:
                query = query.start_after(last_doc_bot)
            query = query.limit(500)
            docs = list(query.stream())
            
            print(f"Fetched {len(docs)} documents in this batch")
            if not docs:  # Break if no more documents are fetched
                print("No more documents to fetch, breaking loop")
                break

            for doc in docs:
                print('Processing document...')
                data = doc.to_dict()
                
                username = data.get('userName')
                date_obj = data.get('date')
                if not date_obj:
                    continue
                # Parse date for trends and categories
                try:
                    day = (date_obj.astimezone(tz).strftime('%Y-%m-%d') if isinstance(date_obj, datetime)
                           else datetime.fromisoformat(date_obj.replace('Z', '+00:00')).astimezone(tz).strftime('%Y-%m-%d')
                           if isinstance(date_obj, str) else None)
                    if not day:
                        continue
                except Exception as e:
                    logger.warning(f"Invalid date format in document {doc.id}: {str(e)}")
                    continue
                
                date_time = datetime.strptime(day, '%Y-%m-%d').replace(tzinfo=tz)
                if operation == 'POST':
                    if start_date and date_time < start_date:
                        continue
                    if end_date and date_time > end_date:
                        continue
                if gender != 'All' and username not in user_lookup:
                    continue
                medical_assist_data[doc.id] = data
                # Update trends and categories with filtered data
                if day:
                    trends[day] += 1
                category = data.get('categroryQuestion', 'no Category')
                if category in valid_categories:
                    categories[category] += 1


            last_doc_bot = docs[-1]  # Update last_doc_bot for the next batch

        # Generate structured data from unfiltered medical_assist_data
        columns = ['userName', 'date', 'userMessage', 'botResponse', 'serialNo','categroryQuestion']
        structured_data = [
            {column: data.get(column, None) for column in columns}
            for data in medical_assist_data.values()
        ]  
        return {
            'structured_data': structured_data,
            'trends': [{"date": day, "count": count} for day, count in sorted(trends.items())],
            'categories': [{"name": k, "count": v} for k, v in sorted(categories.items(), key=lambda x: x[1], reverse=True)]
        }
    except Exception as e:
        logger.error(f"Error in medical bot analytics: {str(e)}")
        return {'structured_data': [], 'trends': [], 'categories': []}

def get_user_analytics(start_date, end_date=None):
    growth = []
    total = 0
    daily_activity = defaultdict(int)
    try:
        user_docs = db.collection('users').where('createdAt', '>=', start_date)
        if end_date:
            user_docs = user_docs.where('createdAt', '<=', end_date)
        user_docs = user_docs.order_by('createdAt').stream()
        login_docs = db.collection('user_logins').where('timestamp', '>=', start_date)
        if end_date:
            login_docs = login_docs.where('timestamp', '<=', end_date)
        login_docs = login_docs.order_by('timestamp').stream()
        for doc in user_docs:
            total += 1
            date = doc.to_dict().get('createdAt')
            if date:
                day = (date.astimezone(tz).strftime('%Y-%m-%d') if isinstance(date, datetime)
                       else date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else None)
                if day:
                    growth.append({"date": day, "count": total})
        for doc in login_docs:
            date = doc.to_dict().get('timestamp')
            if date:
                day = (date.astimezone(tz).strftime('%Y-%m-%d') if isinstance(date, datetime)
                       else date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else None)
                if day:
                    daily_activity[day] += 1
        return {
            'growth': growth,
            'activity': [{"date": day, "count": count} for day, count in sorted(daily_activity.items())]
        }
    except Exception as e:
        logger.error(f"Error in user analytics: {str(e)}")
        return {'growth': [], 'activity': []}

def get_recent_activity():
    try:
        cutoff = datetime.now(tz) - timedelta(days=7)
        query = db.collection('user_logins').where('timestamp', '>=', cutoff).order_by('timestamp', direction=firestore.Query.DESCENDING)
        docs = list(query.stream())
        recent_logs = []
        for doc in docs:
            data = doc.to_dict()
            user_id = data.get('userId')
            if not user_id:
                continue
            user_doc = db.collection('users').document(user_id).get()
            user_data = user_doc.to_dict() if user_doc.exists else {}
            timestamp = data.get('timestamp')
            recent_logs.append({
                'email': user_data.get('email', 'Unknown'),
                'feature': data.get('feature', 'Login'),
                'timestamp': (timestamp.astimezone(tz).isoformat() if isinstance(timestamp, datetime) else timestamp or '')
            })
        return recent_logs
    except Exception as e:
        logger.error(f"Error fetching recent activity: {str(e)}")
        return []

def analyze_feedback_sentiment():
    feedback = {}  # Collect all data unfiltered
    positive_words = [
        'good', 'great', 'excellent', 'awesome', 'love', 'happy', 'fantastic',
        'wonderful', 'amazing', 'perfect', 'superb', 'outstanding', 'brilliant',
        'fabulous', 'terrific', 'marvelous', 'delightful', 'pleased', 'joyful',
        'ecstatic', 'thrilled', 'satisfied', 'glad', 'content', 'cheerful',
        'jubilant', 'elated', 'grateful', 'optimistic', 'hopeful', 'blissful',
        'radiant', 'peaceful', 'lucky', 'fortunate', 'victorious', 'proud',
        'admirable', 'charming', 'enjoyable', 'pleasant', 'refreshing', 'reliable',
        'valuable', 'superior', 'first-class', 'stellar', 'phenomenal', 'incredible',
        'exceptional', 'splendid', 'heavenly', 'divine', 'admirable', 'appealing',
        'captivating', 'enchanting', 'enthralling', 'magnificent', 'remarkable',
        'sublime', 'upbeat', 'vibrant', 'wholesome', 'worthy', 'yummy', 'zealous',
        'admired', 'affectionate', 'agreeable', 'blissful', 'breathtaking', 'commendable',
        'dazzling', 'elegant', 'exhilarating', 'flawless', 'glorious', 'heartwarming',
        'ideal', 'jovial', 'kind', 'laudable', 'majestic', 'noble', 'overjoyed',
        'paradise', 'quality', 'resplendent', 'stellar', 'tranquil', 'unreal', 'valued',
        'wondrous', 'excited', 'fun', 'loved', 'nice', 'positive', 'sweet', 'truthful',
        'upgraded', 'vivid', 'welcoming', 'youthful', 'zesty'
    ]
    negative_words = [
        'bad', 'poor', 'terrible', 'hate', 'angry', 'sad', 'awful', 'horrible',
        'disgusting', 'ugly', 'evil', 'worst', 'painful', 'annoying', 'anxiety',
        'appalling', 'atrocious', 'boring', 'broken', 'cruel', 'crazy',
        'damaged', 'depressed', 'dire', 'dirty', 'disappointing', 'disastrous',
        'dreadful', 'dreary', 'fearful', 'filthy', 'foul', 'frightening', 'ghastly',
        'grave', 'greedy', 'grim', 'gross', 'gruesome', 'hard', 'harmful', 'harsh',
        'hideous', 'hostile', 'hurtful', 'icky', 'infuriating', 'irritating',
        'jealous', 'lousy', 'lumpy', 'malicious', 'mean', 'messy', 'misshapen',
        'missing', 'mistaken', 'moaning', 'moldy', 'monstrous', 'naughty', 'nasty',
        'noxious', 'objectionable', 'odious', 'offensive', 'old', 'oppressive',
        'pathetic', 'petty', 'plain', 'poisonous', 'prejudiced', 'questionable',
        'repulsive', 'revengeful', 'revolting', 'rotten', 'ruthless', 'sad', 'scary',
        'sick', 'sickening', 'sinister', 'slimy', 'smelly', 'sore', 'sorry', 'spiteful',
        'sticky', 'stinky', 'stormy', 'stressful', 'stuck', 'stupid', 'substandard',
        'suspect', 'suspicious', 'tense', 'terrible', 'threatening', 'unhappy',
        'unjust', 'unlucky', 'unpleasant', 'unsatisfactory', 'unsightly', 'untoward',
        'unwanted', 'unwelcome', 'unwholesome', 'unwieldy', 'unwise', 'upset', 'vice',
        'vicious', 'vile', 'villainous', 'vindictive', 'wary', 'weary', 'wicked',
        'woeful', 'worthless', 'wounded', 'yucky', 'zero'
    ]
    
    last_doc_bot = None

    try:
        while True:
            print('Fetching batch of documents...')
            query = db.collection('feedback').order_by('date', direction=firestore.Query.DESCENDING).limit(20)
            if last_doc_bot:
                query = query.start_after(last_doc_bot)
            query = query.limit(500)
            docs = list(query.stream())
            
            print(f"Fetched {len(docs)} documents in this batch")
            if not docs:  # Break if no more documents are fetched
                print("No more documents to fetch, breaking loop")
                break
            sentiment = {"positive": 0, "neutral": 0, "negative": 0}
            for doc in docs:
                print('Processing document...')
                data = doc.to_dict()
                feedback[doc.id] = data
                message = doc.to_dict().get('message', '').lower()
                if any(word in message for word in positive_words):
                    sentiment["positive"] += 1
                elif any(word in message for word in negative_words):
                    sentiment["negative"] += 1
                else:
                    sentiment["neutral"] += 1

            last_doc_bot = docs[-1]  # Update last_doc_bot for the next batch

        # Generate structured data from unfiltered medical_assist_data
        columns = ['name', 'date', 'message', 'email']
        structured_data = [
            {column: data.get(column, None) for column in columns}
            for data in feedback.values()
        ]
        

        return {
            'structured_data': structured_data,
            
            'sentiment': [{"name": k.capitalize(), "count": v} for k, v in sorted(sentiment.items(), key=lambda x: x[1], reverse=True)]
        }

    except Exception as e:
        logger.error(f"Error in medical bot analytics: {str(e)}")
        return {'structured_data': [], 'sentiment':[] }
    
    

def get_recent_feedback():
    try:
        feedbacks = list(db.collection('feedback').order_by('date', direction=firestore.Query.DESCENDING).limit(20).stream())
        feedback_comments = []
        for doc in feedbacks:
            doc_data = doc.to_dict()
            date = doc_data.get('date')
            feedback_comments.append({
                'name': doc_data.get('name', 'Anonymous'),
                'email': doc_data.get('email', 'Unknown'),
                'message': doc_data.get('message', ''),
                'timestamp': (date.astimezone(tz).isoformat() if isinstance(date, datetime) else date or '')
            })
        logger.info(f"Retrieved {len(feedback_comments)} feedback comments")
        return feedback_comments
    except Exception as e:
        logger.error(f"Error fetching recent feedback: {str(e)}")
        return []

def get_active_users_count(days):
    try:
        cutoff = datetime.now(tz) - timedelta(days=days)
        query = db.collection('user_logins').where('timestamp', '>=', cutoff)
        return len(set(doc.to_dict().get('userId', '') for doc in query.stream() if doc.exists and doc.to_dict().get('userId')))
    except Exception as e:
        logger.error(f"Error in get_active_users_count: {str(e)}")
        return 0

def get_new_users_count(days):
    try:
        cutoff = datetime.now(tz) - timedelta(days=days)
        return len(list(db.collection('users').where('createdAt', '>=', cutoff).get()))
    except Exception as e:
        logger.error(f"Error in get_new_users_count: {str(e)}")
        return 0

def calculate_retention_rate(total_users=None):
    try:
        active_week = get_active_users_count(7)
        if total_users is None:
            total_users = len(list(db.collection('users').get()))
        return round((active_week / total_users) * 100, 2) if total_users > 0 else 0.0
    except Exception as e:
        logger.error(f"Error in calculate_retention_rate: {str(e)}")
        return 0.0

def get_recent_entries(collection_name, limit=5):
    try:
        docs = db.collection(collection_name).order_by('date', direction=firestore.Query.DESCENDING).limit(limit).stream()
        return [format_document(doc) for doc in docs]
    except Exception as e:
        logger.error(f"Error in get_recent_entries for {collection_name}: {str(e)}")
        return []

def format_document(doc):
    try:
        data = doc.to_dict()
        timestamp = data.get('date') or data.get('timestamp') or data.get('createdAt')
        return {
            "id": doc.id,
            **data,
            "timestamp": (timestamp.astimezone(tz).isoformat() if timestamp and hasattr(timestamp, 'strftime') else timestamp or None)
        }
    except Exception as e:
        logger.error(f"Error formatting document {doc.id}: {str(e)}")
        return {"id": doc.id, "error": "Failed to format document"}
    
def get_user_growth_analytics(start_date, end_date=None):
    """Fetch user growth data with pagination."""
    trends = defaultdict(int)
    last_doc = None
    try:
        while True:
            query = db.collection('users') \
                     .where('createdAt', '>=', start_date)
            if end_date:
                query = query.where('createdAt', '<=', end_date)
            query = query.order_by('createdAt').limit(500)
            if last_doc:
                query = query.start_after(last_doc)
            docs = list(query.stream())
            if not docs:
                break
            for doc in docs:
                data = doc.to_dict()
                date_obj = data.get('createdAt')
                if not date_obj:
                    continue
                day = (date_obj.astimezone(tz).strftime('%Y-%m-%d') 
                       if isinstance(date_obj, datetime) 
                       else date_obj.strftime('%Y-%m-%d') if hasattr(date_obj, 'strftime') 
                       else None)
                if day:
                    trends[day] += 1
            last_doc = docs[-1] if docs else None
        return [{"date": day, "count": count} for day, count in sorted(trends.items(), key=lambda x: x[0])]
    except Exception as e:
        logger.error(f"Error in user growth analytics: {str(e)}")
        return []


@app.route("/admin/stats", methods=["GET", "POST"])
@cache.cached(timeout=300, unless=lambda: request.method == "POST")
def get_stats():
    """Endpoint for admin statistics"""
    try:
        now = datetime.now(tz)
        timeframes = {
            'today': now.replace(hour=0, minute=0, second=0, microsecond=0),
            'week_ago': now - timedelta(days=7),
            'month_ago': now - timedelta(days=30)
        }

        start_date = timeframes['month_ago']
        end_date = now
        gender = 'All'
        
        if request.method == "POST":
            data = request.get_json() or {}
            start_date_str = data.get('start_date')
            end_date_str = data.get('end_date')
            gender = data.get('gender', 'All')
            try:
                if start_date_str:
                    start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00')).astimezone(tz)
                if end_date_str:
                    end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00')).astimezone(tz)
                if start_date > end_date:
                    return jsonify({"error": "start_date cannot be after end_date"}), 400
                if gender not in ['Male', 'Female', 'All']:
                    return jsonify({"error": "Invalid gender value"}), 400
            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid date format in POST request: {str(e)}")
                return jsonify({"error": "Invalid date format. Use ISO 8601 (e.g., '2025-05-01T00:00:00Z')"}), 400
            logger.info(f"Processing POST request with start_date: {start_date.isoformat()}, end_date: {end_date.isoformat()}, gender: {gender}")
        else:
            logger.info("Processing GET request with default timeframes")

        counters = {doc.id: doc.to_dict() for doc in db.collection('counters').get() if doc.exists}
        total_users = len(list(db.collection('users').get()))
        feedbacks = list(db.collection('feedback').stream())

        disease_analytics = get_enhanced_disease_analytics(start_date, end_date, gender, request.method)
        mental_health_analytics = get_mental_health_analytics(start_date, end_date, gender, request.method)
        user_growth = get_user_growth_analytics(start_date, end_date)
        medical_bot_data = get_medical_bot_analytics(start_date, end_date, gender, request.method)
        user_analytics = get_user_analytics(start_date, end_date)
        recent_logs = get_recent_activity()
        feedback_comments = get_recent_feedback()
        feedback_sentiment = analyze_feedback_sentiment()

        response = {
            "basic_stats": {
                "total_users": total_users or 0,
                "active_today": get_active_users_count(1) or 0,
                "active_week": get_active_users_count(7) or 0,
                "disease_predictions": counters.get('Disease Predictor', {}).get('count', 0),
                "medical_condition_predictions": counters.get('Medical Assistance Bot', {}).get('count', 0),
                "chatbot_interactions": counters.get('Medical Assistance Bot', {}).get('count', 0),
                "mental_health_assessments": counters.get('Mental Health Analyzer', {}).get('count', 0),
                "new_users_week": get_new_users_count(7) or 0,
                "retention_rate": calculate_retention_rate(total_users) or 0.0,
                "feedbacks": len(feedbacks)
            },
            "analytics": {
                "diseaseTrends": disease_analytics['trends'],
                "diseaseCategories": disease_analytics['categories'],
                "diseaseRiskLevels": disease_analytics['risk_levels'],
                "diseaseDoctors": disease_analytics['doctors'],
                "diseaseMedicine": disease_analytics['cures'],
                "diseasealldata": disease_analytics['structured_data'],
                "mentalHealthTrends": mental_health_analytics['trends'],
                "mentalalldata": mental_health_analytics['structured_data'],
                "feedbackalldata": feedback_sentiment['structured_data'],
                "mentalHealthDistribution": mental_health_analytics['distribution'],
                "medicalBotTrends": medical_bot_data['trends'],
                "chatbotTrends": medical_bot_data['trends'],
                "medicalBotCategories": medical_bot_data['categories'],
                "medicalBotalldata": medical_bot_data['structured_data'],
                "userGrowth": user_growth,
                "userActivity": user_analytics['activity'],
                "feedbackSentiment": feedback_sentiment['sentiment']
            }, 
            "recent_activity": {
                "recentLogs": recent_logs,
                "feedback": feedback_comments,
                "recentDiseasePredictions": get_recent_entries('Disease Predictor', 5),
                "recentMentalHealth": get_recent_entries('Mental Health Analyzer', 5),
                "recentMedicalBot": get_recent_entries('Medical Assistance Bot', 5),
                "recentFeedbacks": get_recent_entries('feedback', 5),
                "recentRegistrations": get_recent_entries('registrations', 5)
            }
        }
        logger.info("Stats generated successfully")
        return jsonify(response)
    except Exception as e:
        logger.error(f"Stats generation failed: {str(e)}", exc_info=True)
        error_details = {
            "error": "Failed to generate stats",
            "type": type(e).__name__,
            "message": str(e),
            "timestamp": datetime.now(tz).isoformat()
        }
        return jsonify(error_details), 500

# Shutdown Handler
def shutdown_handler(signum=None, frame=None):
    logger.info("Shutting down gracefully...")
    cache.clear()
    sys.exit(0)

atexit.register(shutdown_handler)
signal.signal(signal.SIGINT, shutdown_handler)
signal.signal(signal.SIGTERM, shutdown_handler)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)