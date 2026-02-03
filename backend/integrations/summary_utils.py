"""
Helpers for CallSummary: infer caller, service, outcome from summary text
when Vapi webhook doesn't send them.
"""
from __future__ import annotations

import re


def _looks_like_business_name(text: str) -> bool:
    """True if text is likely a business/company name, not a service type."""
    if not text or len(text) > 120:
        return True
    t = text.lower()
    # Company indicators: Plumbing, Co., &, " and Co", LLC, Inc, etc.
    if re.search(r"\b(co\.?|llc|inc|plumbing|plumber|services?|company|&)\b", t):
        return True
    if " and " in t and ("co" in t or " co" in t[-4:]):
        return True
    return False


def _infer_service_from_text(text: str) -> str | None:
    """
    Try to extract the actual service/job type from summary or transcript
    (e.g. 'leak repair', 'blocked drain'), not the business name.
    """
    if not text or not text.strip():
        return None
    s = text.strip()
    lower = s.lower()

    # Explicit labels: "service: leak repair", "requested: blocked drain", "issue: ..."
    for pattern in (
        r"(?:service|requested|issue|job|work)\s*[:\-]\s*([^.,\n]+)",
        r"(?:for|needed)\s+(?:a\s+)?(?:plumber\s+for\s+)?([^.,\n]+?)(?:\.|,|$)",
        r"(?:to\s+)(?:book|schedule|report)\s+(?:a\s+)?([^.,\n]+?)(?:\.|,|$)",
        r"(?:booked?|scheduled?)\s+(?:for\s+)?(?:a\s+)?([^.,\n]+?)(?:\.|,|$)",
    ):
        m = re.search(pattern, lower, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            if candidate and len(candidate) > 2 and not _looks_like_business_name(candidate):
                return candidate[:255]

    # Common plumbing/service phrases anywhere in text (short, so not company name)
    service_phrases = [
        r"leak\s+repair(?:\s+in\s+(?:sink|bathroom|kitchen))?",
        r"blocked\s+drain",
        r"sink\s+repair",
        r"drain\s+(?:cleaning|unblock)",
        r"tap\s+repair",
        r"water\s+heater",
        r"boiler\s+repair",
        r"pipe\s+(?:repair|leak)",
        r"toilet\s+repair",
        r"emergency\s+plumb",
    ]
    for pat in service_phrases:
        m = re.search(pat, lower)
        if m:
            return m.group(0).strip()[:255]

    return None


def infer_from_summary(summary: str) -> dict:
    """
    When caller_name, service_name, or outcome are missing, try to infer
    from the summary text. Returns dict with optional caller_name, service_name, outcome.
    """
    out = {}
    if not summary or not isinstance(summary, str):
        return out
    s = summary.strip()
    if not s:
        return out

    # "Zaim called Apex Plumbing to ..." -> caller_name=Zaim only (do NOT use business name as service)
    called_match = re.search(
        r"^([A-Za-z][A-Za-z\s\-']+?)\s+called\s+([^.]+?)(?:\s+to\s+|\s+and\s+|\.|$)",
        s,
    )
    if called_match:
        out["caller_name"] = called_match.group(1).strip()[:255]
        # Do not set service_name from the second group when it looks like a business name
        business_part = called_match.group(2).strip()
        if not _looks_like_business_name(business_part):
            out["service_name"] = business_part[:255]

    # Infer actual service from full summary (e.g. "to book a leak repair in sink")
    if "service_name" not in out:
        inferred_service = _infer_service_from_text(s)
        if inferred_service:
            out["service_name"] = inferred_service[:255]

    # Outcome hints from summary content
    lower = s.lower()
    if (
        "scheduled" in lower
        or "appointment is set" in lower
        or "appointment was scheduled" in lower
    ):
        out["outcome"] = "Booking scheduled"
    elif "rescheduled" in lower:
        out["outcome"] = "Rescheduled"
    elif "cancelled" in lower or "canceled" in lower:
        out["outcome"] = "Cancelled"
    elif "booked" in lower or "booking" in lower:
        out["outcome"] = "Booking created"
    elif len(s) > 20:
        out["outcome"] = "Completed"

    return {k: v for k, v in out.items() if v}
