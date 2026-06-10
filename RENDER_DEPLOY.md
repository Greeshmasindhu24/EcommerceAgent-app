# Render deploy — Single Agent (EcommerceAgent-app)

## Backend (`ecommercesingleagentapp`) — Python Web Service

Live URL: https://ecommercesingleagentapp.onrender.com/

If you see `gunicorn: command not found` and build logs show `Saved lockfile` (yarn/npm),
the service is set as **Node**, not **Python**. Fix in Render Dashboard → Settings:

| Setting | Correct value |
|---------|----------------|
| **Environment** | `Python 3` |
| **Root Directory** | `backend` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `python -m gunicorn app:app --bind 0.0.0.0:$PORT` |

**Environment variables** (Settings → Environment):

- `GEMINI_API_KEY`
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET_KEY`

Then: **Manual Deploy → Clear build cache & deploy**.

Successful Python build logs show `pip install`, not `yarn` / `Saved lockfile`.

## Frontend — Static Site (not Web Service)

| Setting | Correct value |
|---------|----------------|
| **Type** | Static Site |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |
| **REACT_APP_API_URL** | `https://ecommercesingleagentapp.onrender.com` |

Do **not** set a Start Command on the frontend (no gunicorn).

## Verify

- Backend: open `https://ecommercesingleagentapp.onrender.com` — should show API running message.
- Frontend: open your static site URL — Style home page loads and products fetch from backend.
