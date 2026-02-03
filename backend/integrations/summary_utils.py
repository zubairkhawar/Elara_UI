"""
Helpers for CallSummary: infer caller, service, outcome from summary text
when Vapi webhook doesn't send them.
"""
from __future__ import annotations

import re


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

    # "Zaim called Apex Plumbing to ..." -> caller_name=Zaim, service_name=Apex Plumbing
    called_match = re.search(
        r"^([A-Za-z][A-Za-z\s\-']+?)\s+called\s+([^.]+?)(?:\s+to\s+|\s+and\s+|\.|$)",
        s,
    )
    if called_match:
        out["caller_name"] = called_match.group(1).strip()[:255]
        service = called_match.group(2).strip()
        for suffix in (
            " to report",
            " to book",
            " to schedule",
            " and Co.",
            " Co.",
        ):
            if suffix in service:
                service = service.split(suffix)[0].strip()
        if service:
            out["service_name"] = service[:255]

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
