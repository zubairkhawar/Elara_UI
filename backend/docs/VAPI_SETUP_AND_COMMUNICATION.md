# Vapi + Admin Panel: Settings & Communication

One guide for Vapi settings, Django admin, and ensuring your backend receives call data. Backend: **https://elara-ai-backend.onrender.com**

---

## 1. Vapi settings (Phone Number & Assistant)

### Server URL (required for communication)

Set the **same webhook URL** in **both** places so **phone calls** and **dashboard “Talk to assistant” test calls** both send the end-of-call-report to your app.

**Webhook URL:**  
**`https://elara-ai-backend.onrender.com/api/v1/vapi/webhook/_au-u6TlPIyrZhP0gkCT2IukCPz_gJno8BAsAaU7u3I/`**

- **Assistant** (so test calls from the dashboard create Call summaries):
  - **Vapi** → **Assistants** → open your assistant (e.g. Apex Plumbing Co.).
  - Find **Server URL** / **Webhook URL** and set it to the URL above.
  - In **Server Messages** / **Message types** / **Events**, include **end-of-call-report**.
- **Phone Number** (so real phone calls create Call summaries):
  - **Vapi** → **Phone Numbers** → open the number (e.g. +1 272 235 0282).
  - **Server URL** = same URL above.
  - **Timeout:** 20 seconds. **Authorization:** leave empty unless you add auth later.

Replace the token with the user’s **Vapi webhook token** from Django admin if you use a different user.

### End-of-call report (required)

- On **both** the Assistant and the Phone Number: **Server Messages** / **Message types** / **Events** — include **end-of-call-report** so your backend gets transcript, summary, caller, and outcome.

### Inbound settings

- **Inbound Phone Number:** Your Vapi number (e.g. +12722350282).
- **Assistant:** Assign the correct assistant (e.g. Apex Plumbing Co.) so incoming calls use the right agent.

### Outbound (optional)

- Only needed if you make outbound calls from this number; leave as-is for inbound-only.

---

## 2. Admin panel (Django)

### URL

- **`https://elara-ai-backend.onrender.com/admin/`**
- Log in with your superuser (e.g. zubairkhawer@gmail.com / abcd1234).

### Per-user (client) settings

1. **ACCOUNTS** → **Users** → open the user (e.g. the one for Apex Plumbing & Co.).
2. **Vapi (per-client webhook):**
   - **Vapi webhook token:** If empty, use the action **Generate Vapi webhook token** on the Users list, then reopen the user.
   - **Webhook URL for Vapi:** Shown read-only. Use it in Vapi’s Server URL with your backend domain:  
     `https://elara-ai-backend.onrender.com/api/v1/vapi/webhook/<token>/`
   - **Vapi assistant id:** Optional. Paste the assistant ID from Vapi (e.g. `d52979ab-d24a-47d7-a817-094516346314`) for reference.
   - **Vapi phone number:** Optional. Paste the number assigned in Vapi (e.g. `+12722350282`) for reference.
3. **Onboarding:**
   - **Setup status:** Set to **Vapi agent configured** or **Live** when the agent and webhook are done.
   - **Admin notes:** Optional internal notes.
4. **Save.**

### Checklist (admin)

| Item | Where | Action |
|------|--------|--------|
| Token | Users → user → Vapi webhook token | Generate if blank; copy into Vapi Server URL path. |
| Webhook URL in Vapi | Vapi → Phone Number → Server URL | Full URL: `https://elara-ai-backend.onrender.com/api/v1/vapi/webhook/<token>/` |
| Assistant ID | Users → user → Vapi assistant id | Optional; paste from Vapi. |
| Phone | Users → user → Vapi phone number | Optional; e.g. +12722350282. |
| Setup status | Users → user → Setup status | Set to Vapi agent configured or Live. |

---

## 3. Ensuring communication (webhook ↔ backend)

### Quick webhook test (curl)

Run this to confirm the backend accepts the webhook and creates a call summary:

```bash
BASE="https://elara-ai-backend.onrender.com"
TOKEN="_au-u6TlPIyrZhP0gkCT2IukCPz_gJno8BAsAaU7u3I"

curl -X POST "$BASE/api/v1/vapi/webhook/$TOKEN/" \
  -H "Content-Type: application/json" \
  -d '{"message":{"type":"end-of-call-report"},"call":{},"transcript":"Test","summary":"Test call"}'
```

- **Expected:** `{"ok": true, "action": "created"}` and a new row in Call summaries (app or admin).
- **If** `{"ok": false, "reason": "unknown_token"}`: token in URL does not match the user’s **Vapi webhook token** in Django admin — fix the token in Vapi Server URL or regenerate in admin.

### After a real call

1. **App:** Log in → **Dashboard → Call summaries**. You should see the call (transcript/summary may appear shortly after hangup).
2. **Admin:** **https://elara-ai-backend.onrender.com/admin/** — if CallSummary is registered, you’ll see it there too.
3. **Vapi:** Call appears in Vapi dashboard; Server URL is used for end-of-call-report.

### How to check if Vapi sent data to your server

1. **Render logs**  
   - Go to **Render** → your backend service → **Logs**.  
   - End a test call in Vapi, then look in the logs around that time for:
     - **`Vapi webhook received: POST /api/v1/vapi/webhook/<token>/`** — your server got a POST from Vapi.  
     - **`Vapi webhook: CallSummary created id=...`** or **`CallSummary updated id=...`** — the backend processed it and saved a row.  
   - If you see **no** “Vapi webhook received” line when you end the call, Vapi did **not** send the end-of-call-report to your URL. Check in Vapi: Assistant (and Phone Number) **Server URL** and **end-of-call-report** in Server Messages.

2. **Confirm backend with curl**  
   Run the curl command above. If you get `{"ok": true, "action": "created"}` and a new row in Call summaries, the backend is fine; the issue is Vapi not calling your URL (wrong URL or end-of-call-report not enabled).

### Troubleshooting

| Symptom | Likely cause | Fix |
|--------|----------------|-----|
| No call summary after call | Webhook not reached | In Vapi, set Server URL to **exactly** `https://elara-ai-backend.onrender.com/api/v1/vapi/webhook/<token>/` (correct token from admin). |
| `unknown_token` from curl or logs | Token mismatch | In admin, user’s **Vapi webhook token** must match the `<token>` segment in the Vapi Server URL. |
| Call summary created but empty transcript/summary | Vapi not sending full report | In Vapi, enable **end-of-call-report** (or equivalent) in Server Messages / events for the assistant or phone number. |
| Can’t reach agent on the number | Number or assistant not set | In Vapi → Phone Numbers → Inbound: assign the correct Assistant to the number; ensure number is active. |

---

## 4. Test call script (optional)

Call **+1 272 235 0282** and use this as a loose script:

1. **Greeting:** "Hi, I’d like to book a plumber."
2. **Service:** "Blocked drain in the kitchen. Not urgent."
3. **Details:** Give name, phone, address when asked.
4. **Time:** Pick one of the offered times.
5. **Confirm:** "Yes, that’s correct." Then "No, that’s all. Thanks." and hang up.

Then check **Dashboard → Call summaries** (and admin) for the new call.

---

## Summary

1. **Vapi:** Server URL = `https://elara-ai-backend.onrender.com/api/v1/vapi/webhook/<token>/`; enable end-of-call-report; assign assistant to phone number.
2. **Admin:** **https://elara-ai-backend.onrender.com/admin/** — set per-user token (generate if needed), optional assistant ID and phone, setup status.
3. **Communication:** Test with the curl command; after a real call, verify Call summaries in the app and admin; use the troubleshooting table if something fails.
