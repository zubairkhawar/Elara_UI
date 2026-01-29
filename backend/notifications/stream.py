"""
Server-Sent Events for live alerts.
Maintains per-user queues; when an Alert is created, it is pushed to all
connected clients for that user.
"""
from __future__ import annotations

import json
import logging
import queue
import threading
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import Alert

logger = logging.getLogger(__name__)

# user_id -> list of queue.Queue (one per SSE connection)
_alert_queues: dict[int, list[queue.Queue]] = {}
_lock = threading.Lock()


def register_queue(user_id: int) -> queue.Queue:
    q: queue.Queue = queue.Queue()
    with _lock:
        _alert_queues.setdefault(user_id, []).append(q)
    return q


def unregister_queue(user_id: int, q: queue.Queue) -> None:
    with _lock:
        if user_id in _alert_queues:
            try:
                _alert_queues[user_id].remove(q)
            except ValueError:
                pass
            if not _alert_queues[user_id]:
                del _alert_queues[user_id]


def push_alert_to_user(user_id: int, alert_payload: dict) -> None:
    """Push a serialized alert to all SSE connections for this user."""
    with _lock:
        queues = list(_alert_queues.get(user_id, []))
    for q in queues:
        try:
            q.put_nowait(alert_payload)
        except queue.Full:
            pass
