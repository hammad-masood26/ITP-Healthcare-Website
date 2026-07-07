# Environment Setup

This project uses separate environment files for the Next.js frontend and Flask backend.

## Frontend

Create `healthcare/.env.local` for development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, create `healthcare/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

`NEXT_PUBLIC_` variables are available in the browser, so do not store secrets in them.

## Backend

Create `server/.env` for development:

```env
FRONTEND_URL=http://localhost:3000
FIREBASE_CERT_PATH=healthcare/app/firebase/service_account_key.json
FIREBASE_DATABASE_URL=https://healthcare-website-9afe5.firebaseio.com
PORT=5000
DEBUG=True
```

For production, use production URLs and disable debug mode:

```env
FRONTEND_URL=https://your-app-domain.com
FIREBASE_CERT_PATH=/path/to/service_account_key.json
FIREBASE_DATABASE_URL=https://your-firebase-project.firebaseio.com
PORT=5000
DEBUG=False
```

## Local Setup

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

## Required Variables

| Variable | Used By | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Frontend | Flask API base URL |
| `NEXT_PUBLIC_APP_URL` | Frontend | App URL for redirects and links |
| `FRONTEND_URL` | Backend | Allowed frontend origin for CORS |
| `FIREBASE_CERT_PATH` | Backend | Firebase service account path |
| `FIREBASE_DATABASE_URL` | Backend | Firebase database URL |
| `PORT` | Backend | Flask server port |
| `DEBUG` | Backend | Flask debug mode |

## Security Notes

- Do not commit `.env`, `.env.local`, `.env.production`, or service account keys.
- Keep `service_account_key.json` private and use secure secret storage in production.
- Restart frontend/backend servers after changing environment files.

Suggested `.gitignore` entries:

```gitignore
.env
.env.local
.env.*.local
*.env.production
healthcare/app/firebase/service_account_key.json
```

## Troubleshooting

- Variables not loading: verify the file is in the correct folder and restart the server.
- CORS errors: ensure backend `FRONTEND_URL` matches the frontend domain.
- API errors: ensure frontend `NEXT_PUBLIC_API_URL` points to the running Flask server.
- Firebase errors: verify `FIREBASE_CERT_PATH` and Firestore permissions.
