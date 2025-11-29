# ITP Healthcare Website

A comprehensive healthcare platform that combines AI-powered disease prediction, mental health assessment, and medical assistance chatbot with a professional admin dashboard for analytics and monitoring.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Frontend Pages](#frontend-pages)
- [Admin Dashboard](#admin-dashboard)
- [Database Schema](#database-schema)
- [Contributing](#contributing)

## Project Overview

ITP Healthcare is an integrated healthcare solution designed to provide:

- **Disease Prediction**: AI-based symptom analysis for disease prediction and medical recommendations
- **Mental Health Support**: Chatbot-driven mental health assessment and support
- **Medical Assistance**: Intelligent Q&A system for medical information and guidance
- **Admin Analytics**: Comprehensive dashboard for tracking platform metrics and user insights

The platform combines Next.js frontend with Python Flask backend, Firebase for real-time database, and machine learning models for predictions.

## Features

### 1. **Disease Prediction System**
- Symptom-based disease prediction using ML models
- Automatic recommendations for:
  - Predicted disease
  - Suggested cures/treatments
  - Recommended doctor specialists
  - Risk level assessment
- User history tracking with Firestore

### 2. **Mental Health Analyzer**
- Depression and anxiety detection through conversation analysis
- Supportive responses based on detected mental state
- Classification into categories:
  - Suicidal
  - Depressed
  - Anxiety
  - Normal
  - Other
- Session tracking and analytics

### 3. **Medical Assistance Bot**
- Semantic similarity-based Q&A system
- Pre-trained embeddings for fast response retrieval
- Question categorization (symptoms, treatment, prevention, etc.)
- Context-aware medical information retrieval

### 4. **Admin Dashboard**
- Real-time analytics and statistics
- Multi-tab interface with:
  - Overall performance metrics
  - Disease prediction trends
  - Mental health distribution
  - Medical bot query analytics
  - Feedback sentiment analysis
- Time-range filtering and gender-based analytics
- Data visualization with charts and tables
- User growth and retention metrics

### 5. **User Management**
- Firebase Authentication (sign-up/sign-in)
- User profile management
- Medical history tracking
- Session logging

## Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 4.1.4
- **State Management**: React Hooks
- **API Client**: Axios
- **Database**: Firebase (Firestore)
- **Authentication**: Firebase Auth
- **Icons**: React Icons, FontAwesome, Lucide React
- **Charts**: Recharts 2.15.3

### Backend
- **Framework**: Flask 3.1.1
- **Language**: Python 3.x
- **API**: RESTful with CORS support
- **Database**: Firebase Firestore
- **ML Libraries**:
  - Scikit-learn 1.6.1 (ML models)
  - Sentence Transformers 4.1.0 (embeddings)
  - PyTorch 2.7.0 (neural networks)
  - Transformers 4.52.2 (pre-trained models)
  - NumPy 2.2.6 (numerical computing)
- **Caching**: Flask-Caching
- **Timezone**: Pytz (Asia/Karachi)

### Infrastructure
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Deployment**: Gunicorn (production)

## Project Structure

```
ITP_healthcare/
├── healthcare/                          # Next.js frontend application
│   ├── app/
│   │   ├── page.js                     # Home page
│   │   ├── layout.js                   # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── admin_panel/                # Admin dashboard
│   │   │   ├── page.tsx               # Admin main page
│   │   │   ├── DashboardStats.tsx     # Stats component
│   │   │   ├── types.ts               # TypeScript types
│   │   │   └── tabs/                  # Dashboard tabs
│   │   │       ├── OverallTab.tsx
│   │   │       ├── DiseasePredictorTab.tsx
│   │   │       ├── MentalHealthTab.tsx
│   │   │       ├── MedicalAssistanceTab.tsx
│   │   │       └── FeedbackTab.tsx
│   │   ├── components/                 # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── page1.tsx
│   │   ├── firebase/                   # Firebase configuration
│   │   │   ├── config.js
│   │   │   └── service_account_key.json
│   │   ├── prediction/                 # Disease prediction page
│   │   │   └── page.jsx
│   │   ├── mental_health/              # Mental health chatbot page
│   │   │   └── page.jsx
│   │   ├── medical_assistance/         # Medical bot page
│   │   │   └── page.tsx
│   │   ├── sign-in/                    # Authentication pages
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   ├── assets/
│   │   └── assets.js                   # Asset imports
│   ├── public/                         # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   └── eslint.config.mjs
│
├── server/                              # Flask backend
│   ├── server.py                       # Main Flask application
│   ├── demoserver.py                   # Demo server
│   ├── Authentication Middleware.py    # Auth middleware
│   ├── requirment.txt                  # Python dependencies
│   ├── disease_material/               # Disease prediction models
│   │   ├── disease_model.pkl
│   │   ├── disease_vectorizer.pkl
│   │   ├── disease_le.pkl
│   │   └── disease_label_encoders.pkl
│   ├── mental_material/                # Mental health models
│   │   ├── dep_model.pkl
│   │   ├── dep_vectorizer.pkl
│   │   └── dep_le.pkl
│   └── medical_assistance_material/    # Medical bot embeddings
│       └── model_embeddings.pkl
│
└── .git/                               # Git repository
```

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Firebase project account
- Git

### Frontend Setup

```bash
# Navigate to frontend directory
cd healthcare

# Install dependencies
npm install

# Create .env.local file with Firebase config
# (See Configuration section)
```

### Backend Setup

```bash
# Navigate to backend directory
cd server

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirment.txt
```

## Configuration

### Frontend Firebase Configuration

Create `healthcare/app/firebase/config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Backend Firebase Configuration

Place Firebase service account key at: `healthcare/app/firebase/service_account_key.json`

Update the path in `server/server.py` line 35:
```python
cred = credentials.Certificate(r"healthcare/app/firebase/service_account_key.json")
```

### Environment Variables

**Backend (.env or environment setup)**:
```
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=https://healthcare-website-9afe5.firebaseio.com
```

## Running the Project

### Development Mode

**Terminal 1 - Frontend**:
```bash
cd healthcare
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Backend**:
```bash
cd server
python server.py
# Runs on http://localhost:5000
```

### Production Build

**Frontend**:
```bash
cd healthcare
npm run build
npm start
```

**Backend**:
```bash
cd server
gunicorn --workers 4 --bind 0.0.0.0:5000 server:app
```

## API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. Health Check
```
GET /health
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-28T10:30:00+05:00",
  "models_loaded": ["disease", "mental_health", "medical_assistance"]
}
```

#### 2. Disease Prediction
```
POST /disease
Content-Type: application/json

{
  "symptoms": "fever and headache"
}
```

Response:
```json
{
  "prediction": {
    "disease": "Common cold",
    "cures": "Rest and hydration",
    "doctor": "General practitioner",
    "risk level": "Low"
  }
}
```

#### 3. Mental Health Assessment
```
POST /mental_health
Content-Type: application/json

{
  "message": "I've been feeling depressed and anxious lately"
}
```

Response:
```json
{
  "reply": "Depressed"
}
```

#### 4. Medical Assistance
```
POST /medical_assistance
Content-Type: application/json

{
  "query": "What are the symptoms of diabetes?"
}
```

Response:
```json
{
  "reply": {
    "Answer": "Common symptoms include increased thirst, frequent urination, fatigue...",
    "Category": "symptoms"
  }
}
```

#### 5. Admin Statistics
```
GET /admin/stats
```

**Or with filters**:
```
POST /admin/stats
Content-Type: application/json

{
  "start_date": "2025-11-01T00:00:00Z",
  "end_date": "2025-11-28T23:59:59Z",
  "gender": "Female"
}
```

Response:
```json
{
  "basic_stats": {
    "total_users": 150,
    "active_today": 45,
    "active_week": 120,
    "disease_predictions": 340,
    "mental_health_assessments": 280,
    "chatbot_interactions": 650,
    "retention_rate": 78.5
  },
  "analytics": {
    "diseaseTrends": [...],
    "diseaseCategories": [...],
    "mentalHealthDistribution": [...],
    "feedbackSentiment": [...]
  },
  "recent_activity": {...}
}
```

## Frontend Pages

### Public Pages
- **Home** (`/`): Landing page with hero section, services overview, about, and contact
- **Sign Up** (`/sign-up`): User registration
- **Sign In** (`/sign-in`): User login

### Protected Pages (Authentication Required)
- **Disease Predictor** (`/prediction`): Symptom-based disease prediction interface
- **Mental Health** (`/mental_health`): Mental health chatbot interface
- **Medical Assistance** (`/medical_assistance`): Medical Q&A chatbot interface
- **Admin Dashboard** (`/admin_panel`): Analytics and monitoring dashboard

### Components
- **Navbar**: Navigation bar with branding and links
- **Header**: Hero section with call-to-action
- **Services**: Overview of available services
- **About**: Information about the platform
- **Contact**: Contact form and information
- **Footer**: Footer with links and information

## Admin Dashboard

### Tabs

#### 1. Overall Tab
- Total users, active users (today, week), retention rate
- Overview of all predictions and interactions
- Recent activity logs
- Platform statistics

#### 2. Disease Predictor Tab
- Disease prediction trends over time
- Top predicted diseases
- Risk level distribution
- Doctor specializations requested
- Common treatments recommended
- Detailed table of all predictions

#### 3. Mental Health Tab
- Mental health assessment trends
- Distribution of conditions (Suicidal, Depressed, Anxiety, Normal)
- Time-range filtering
- Detailed conversation logs

#### 4. Medical Assistance Tab
- Medical bot query trends
- Question categories distribution
- Common topics asked about
- Bot response statistics
- Detailed query logs

#### 5. Feedback Tab
- Sentiment analysis (Positive, Neutral, Negative)
- Feedback comments with timestamps
- User satisfaction overview
- Trend analysis

### Features
- **Time Range Filtering**: Select custom date ranges for analytics
- **Gender Filtering**: Filter data by user gender
- **Data Export**: View detailed structured data in tables
- **Real-time Updates**: Dashboard stats update automatically
- **Caching**: 300-second cache for better performance

## Database Schema

### Collections

#### users
```
{
  email: string,
  displayName: string,
  createdAt: timestamp,
  gender: string,
  profile: object
}
```

#### registrations
```
{
  name: string,
  gender: string,
  email: string,
  age: number,
  registeredAt: timestamp
}
```

#### Disease Predictor
```
{
  userName: string,
  date: timestamp,
  inputDescription: string,
  disease: string,
  cures: string,
  doctor: string,
  riskLevel: string,
  serialNo: number
}
```

#### Mental Health Analyzer
```
{
  userName: string,
  date: timestamp,
  userMessage: string,
  botResponse: string,
  condition: string,
  serialNo: number
}
```

#### Medical Assistance Bot
```
{
  userName: string,
  date: timestamp,
  userMessage: string,
  botResponse: string,
  categroryQuestion: string,
  serialNo: number
}
```

#### feedback
```
{
  name: string,
  email: string,
  message: string,
  date: timestamp
}
```

#### counters
```
{
  "Disease Predictor": { count: number },
  "Mental Health Analyzer": { count: number },
  "Medical Assistance Bot": { count: number }
}
```

## Key Features Implementation

### 1. Text Sanitization
- Removes HTML tags, URLs, punctuation
- Normalizes text to lowercase
- Removes numeric characters
- Trims whitespace

### 2. ML Model Integration
- Disease prediction using vectorization and label encoding
- Mental health classification using trained models
- Medical assistance using sentence embeddings and cosine similarity

### 3. Analytics
- Pagination support for large datasets
- Timezone handling (Asia/Karachi)
- Gender-based filtering
- Date range filtering
- Trend calculation

### 4. Error Handling
- Comprehensive try-catch blocks
- Detailed logging
- User-friendly error messages
- Firebase connection validation

### 5. Caching
- Flask-Caching for stats endpoint
- 300-second cache timeout
- Cache invalidation on POST requests

## Testing

### Backend Health Check
```bash
curl http://localhost:5000/health
```

### Frontend Verification
```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify service account key path
   - Check Firebase credentials in frontend config
   - Ensure internet connection

2. **Model Loading Failed**
   - Verify pickle files exist in model directories
   - Check file permissions
   - Ensure correct Python version compatibility

3. **Port Already in Use**
   - Frontend: Change port in `next.config.mjs`
   - Backend: Use `python server.py --port 5001`

4. **CORS Errors**
   - Verify Flask-CORS is configured correctly
   - Check origin headers in requests
   - Ensure cross_origin decorator is applied

## Performance Optimization

- Caching enabled for admin stats (300s)
- Pagination for database queries (batch size: 500)
- Vector embeddings pre-computed
- Lazy loading of components
- Image optimization in Next.js

## Security Considerations

- Firebase authentication required for protected routes
- Input sanitization for all user inputs
- Server-side validation for all API requests
- Environment variables for sensitive data
- CORS configuration to restrict origins

## Future Enhancements

- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Advanced ML model improvements
- [ ] Video consultation integration
- [ ] Prescription management
- [ ] Insurance integration
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Data export functionality
- [ ] Role-based access control (RBAC)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is part of the ITP (Intelligent Technology Platform) Healthcare initiative.

## Support

For issues and support:
- Create an issue in the GitHub repository
- Contact the development team
- Check existing documentation

## Authors

- Hammad Masood - [@hammad-masood26](https://github.com/hammad-masood26)

## Acknowledgments

- Firebase for backend infrastructure
- Next.js team for excellent framework
- Scikit-learn and PyTorch communities
- OpenAI and Hugging Face for pre-trained models
