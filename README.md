## Elara AI

Elara AI is an AI-powered voice booking platform for small businesses. It connects to a Vapi voice agent to handle inbound calls, book appointments, and manage customers 24/7, with a web dashboard for owners to review and manage everything.

### Tech stack

- **Frontend**: Next.js / React (App Router), Tailwind-style utility classes
- **Backend**: Django + Django REST Framework
- **Auth**: Email + password with JWT (SimpleJWT)
- **Voice**: Vapi webhooks (per-client token + assistant id / phone)
- **Database**: PostgreSQL

### Local development

1. **Clone & install frontend deps**
   ```bash
   git clone <your-repo-url>
   cd clara-ai
   npm install
   npm run dev
   ```

2. **Backend setup**
   ```bash
   cd backend
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   cp env.example .env  # if present; otherwise create .env matching config/settings.py
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend → Backend connection**
   - By default the frontend points to `http://localhost:8000` via `NEXT_PUBLIC_API_BASE_URL`.
   - For production, set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend URL.

### Key backend concepts

- **User model** (`accounts.User`)
  - Email-based login.
  - Business metadata (name, phone, business type, service hours).
  - Vapi fields: `vapi_webhook_token`, `vapi_assistant_id`, `vapi_phone_number`.
  - Onboarding: `setup_status`, `admin_notes`.
  - Access control: `is_active` (login allowed only when `True`).

- **Signup & activation**
  - Public signup creates users as **inactive**, with `signup_source="self"`.
  - Clients **cannot log in** until an admin sets `is_active=True` in Django admin.
  - When a user is activated, the backend sends a **“Your account is ready”** email (if email is configured).

- **Vapi integration**
  - Each user can have their own `vapi_webhook_token` which forms the webhook URL:
    `/api/v1/vapi/webhook/<token>/`
  - In Vapi, configure this URL (with your domain) as the agent’s webhook.

### Email configuration (Gmail)

To send activation emails and other transactional mail:

- Set these environment variables in your backend environment (locally via `.env`, in production via your host’s env/secret UI):
  - `EMAIL_HOST_USER` – Gmail address to send from.
  - `EMAIL_HOST_PASSWORD` – Gmail **App Password** (not your normal password).
- For production on Render, add these in **Environment → Environment Variables**, then redeploy.

### Deployment notes

- **Backend**: Designed to run behind Gunicorn (e.g. on Render) with PostgreSQL.
  - For Server‑Sent Events (`/api/v1/alerts/stream/`), ensure Gunicorn timeout is high enough, e.g.:
    ```bash
    gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 600
    ```
- **Frontend**: Deployable to Vercel. Set `NEXT_PUBLIC_API_BASE_URL` to your backend URL and redeploy.

