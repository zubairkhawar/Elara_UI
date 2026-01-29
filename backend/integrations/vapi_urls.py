from __future__ import annotations

from django.urls import path

from . import vapi_views

urlpatterns: list = [
    path("webhook/", vapi_views.vapi_webhook, name="webhook"),
]

