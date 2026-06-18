# ITP Healthcare Website

ITP Healthcare is an AI-powered healthcare platform with disease prediction, mental health analysis, medical assistance chat, Firebase authentication, and an admin analytics dashboard.

## Features

- Disease predictor based on user symptoms, including disease, cure, doctor, and risk-level suggestions.
- Mental health analyzer for classifying user text into mental health categories.
- Medical assistance chatbot for health-related Q&A.
- Firebase sign-up/sign-in with standard and Google authentication.
- Admin dashboard with user, feedback, prediction, chatbot, and mental health analytics.
- Contact form with Firestore feedback storage.

## Tech Stack

- Frontend: Next.js 15, React 19, Tailwind CSS, Recharts, Firebase Auth/Firestore.
- Backend: Python Flask, Firebase Admin SDK, Flask-CORS, Flask-Caching.
- ML: Scikit-learn, PyTorch, Transformers, Sentence Transformers.

## Project Structure

```text
ITP-healthcare/
├── healthcare/                 # Next.js frontend
│   ├── app/                    # Pages, layout, components, admin panel
│   ├── assets/                 # Frontend asset exports
│   └── package.json
├── server/                     # Flask backend and ML models
│   ├── server.py
│   ├── requirment.txt
│   ├── disease_material/
│   ├── mental_material/
│   └── medical_assistance_material/
├── ENV_SETUP_GUIDE.md
└── README.md
```

## Setup

Prerequisites:

- Node.js 18+
- Python 3.8+
- Firebase project and service account key

Frontend:

```bash
cd healthcare
npm install
npm run dev
```

Backend:

```bash
cd server
pip install -r requirment.txt
python server.py
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

Environment variables are documented in `ENV_SETUP_GUIDE.md`.

## Main Routes

Frontend:

- `/` - Landing page
- `/sign-up` - Register account
- `/sign-in` - Login
- `/prediction` - Disease predictor
- `/mental_health` - Mental health analyzer
- `/medical_assistance` - Medical assistant chat
- `/admin_panel` - Admin dashboard

Backend API:

- `GET /health` - Health check
- `POST /disease` - Disease prediction
- `POST /mental_health` - Mental health analysis
- `POST /medical_assistance` - Medical assistant response
- `GET|POST /admin/stats` - Dashboard analytics

## Firebase Collections

- `users` - User profiles and roles
- `registrations` - Registration records
- `Disease Predictor` - Disease prediction history
- `Mental Health Analyzer` - Mental health analysis history
- `Medical Assistance Bot` - Chatbot interactions
- `feedback` - Contact form feedback
- `counters` - Serial counters for records

## Production

Frontend:

```bash
cd healthcare
npm run build
npm start
```

Backend:

```bash
cd server
```

Use production environment variables, secure Firebase credentials, and set backend `DEBUG=False`.

## Security Notes

- Do not commit `.env` files or Firebase service account keys.
- Use server-side validation for all backend endpoints.
- Keep CORS restricted to the frontend domain in production.
- Protect admin access with Firebase roles.

## Authors

- Hammad Masood - [@hammad-masood26](https://github.com/hammad-masood26)
