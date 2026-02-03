# Bookings, Services, Opening Hours & Analytics

This doc answers how bookings from VAPI transcripts relate to your app’s **services**, **opening hours**, **conflict checking**, **service name** in call summaries, and **pricing/analytics**.

---

## 1. Why add Services (and Opening Hours) if bookings come from the transcript?

**Short answer:** Services and opening hours are what make the voice agent and your dashboard accurate and useful.

- **Services in the app**
  - **Linking calls to the right service:** When a call creates a CallSummary, we match the mentioned service (e.g. “leak repair”) to your **Service** list by name. The created/updated **Booking** then gets that `service` (and its **price**). Without services in the app, we can’t attach a service or price to the booking.
  - **Dashboard analytics:** Revenue and “monthly sales” are computed from **Booking.service.price** (i.e. the price of the service linked to each booking). So the client’s **Services** (with prices) are what drive analytics.
  - **Voice agent:** The agent can be given your list of services (and prices) via your VAPI assistant config / knowledge so it can quote correctly and use consistent names that match the app.

- **Opening hours (when you add them)**
  - **What the agent says:** So the agent can tell callers “We’re open Mon–Fri 9–5” and only offer times within those hours.
  - **Which slots are “available”:** An **availability/slots API** (see below) can return only slots that fall inside opening hours and are not already booked. So the agent doesn’t offer closed times or double-book.

So: **bookings are created from the transcript**, but **services (and later opening hours) are the source of truth** for what can be booked, what price to use, and what the agent should say and offer.

---

## 2. How does the agent check if a time slot is already booked?

**Current state:** The backend did not expose an API that the VAPI agent calls **during** the call. The dashboard has a heatmap of bookings, but the agent had no way to ask “which slots are free on date X?”. So the agent could not reliably avoid double-booking.

**Solution:** Add an **available-slots API** that:

- Accepts a **date** (and optionally time zone).
- Returns **free slots** (e.g. 30‑minute slots) for that day, optionally respecting:
  - Existing bookings (exclude occupied slots).
  - Opening hours (when you add them), so only “open” slots are returned.

The VAPI assistant then calls this API (via **Server URL / function/tool**) when the caller asks for availability or picks a day. The agent only offers slots that this API returns, so it **does** check that a slot is not already taken.

**Implementation:** See the new `GET /api/v1/bookings/available-slots/?date=YYYY-MM-DD` endpoint and the “Agent integration” section in this repo; the agent must be configured in VAPI to call that URL (with the user’s auth or a server-side token) so it can check availability in real time.

---

## 3. Call summary showing “Apex Plumbing” instead of the actual service (e.g. “leak repair in sink”)

**Cause:** The inference logic in `summary_utils.infer_from_summary` was built for phrases like “*Name* called *Business* to …”. It took the second part as `service_name`, so for “Zaim called **Apex Plumbing** to …” it set `service_name = "Apex Plumbing"` (the business name), not the actual job (e.g. “leak repair in sink”).

**Fixes (implemented or recommended):**

1. **Inference logic (backend):**
   - **Do not** use the “called X” phrase to set `service_name` when “X” looks like a business name (e.g. contains “Plumbing”, “Co”, “&”, “ and ”).
   - **Do** infer the real service from the rest of the summary/transcript, e.g.:
     - “to book/schedule/report (a) **leak repair**”, “for (a) **blocked drain**”, “needed **sink repair**”.
     - Patterns like “service: …”, “requested: …”, “issue: …”.
   - Optionally: match the inferred text against the owner’s **Service** list (e.g. by substring or fuzzy match) and, if one matches, use that **Service**’s `name` as `service_name` so the call summary and the booking both show the same catalog service.

2. **VAPI side (recommended):**
   - In the assistant’s **end-of-call report** or **summary**, have the model explicitly output a **service** field (e.g. “leak repair”, “blocked drain”) that describes the *type of work*, not the company name. Your webhook already reads `serviceName` / `service` from the payload; if VAPI sends the actual service there, we use it and inference is only a fallback.

With the backend inference fixed and (optionally) VAPI sending the correct service, the call summary tab will show the real service (e.g. “Leak repair in sink”) instead of “Apex Plumbing”.

---

## 4. How does the client set pricing for services so dashboard analytics are correct?

**Already supported:** The client sets pricing in the app on **Dashboard → Services**. Each **Service** has a **price** (and currency). That is the source of truth.

**How analytics use it:**

- **Monthly sales** and **revenue charts** use **Booking.service.price**: for each booking that has a `service` set, we sum `service.price`. So:
  - Client defines services and prices in the app.
  - When a booking is created (from a call or manually), it is linked to a **Service**.
  - Analytics = sum of those services’ prices for the selected period.

**For this to be accurate:**

- Bookings created from calls must be linked to the **correct** service (see section 3: correct `service_name` and matching to your Service list).
- If the webhook or inference sets a wrong or generic `service_name`, the booking might get the wrong service (or a fallback), and revenue will be off. Improving service inference and matching (section 3) keeps analytics aligned with what was actually booked.

**Optional:** Your webhook also stores `CallSummary.price` when VAPI sends a price (e.g. quoted price on the call). Right now revenue is **only** from `Booking.service.price`. If you want “revenue from quoted price on call” you could later add a report that uses `CallSummary.price` for call-originated bookings; the main dashboard can stay on **Service** prices for consistency with your catalog.

---

## Summary

| Topic | Purpose |
|-------|--------|
| **Services in app** | Link call → correct service & price; drive revenue analytics; let agent quote your catalog. |
| **Opening hours** | (When added) Restrict what the agent says and which slots the availability API returns. |
| **Agent vs existing bookings** | Use the new **available-slots** API so the agent only offers free slots. |
| **Service in call summary** | Fixed inference so we use the actual job (e.g. leak repair), not the business name; prefer VAPI sending `serviceName`. |
| **Pricing for analytics** | Set on **Services** in the app; analytics use **Booking.service.price**. |
