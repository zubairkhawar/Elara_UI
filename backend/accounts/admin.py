from __future__ import annotations

import secrets

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

User = get_user_model()


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    list_display = [
        "email",
        "name",
        "business_name",
        "signup_source",
        "setup_status",
        "vapi_token_status",
        "vapi_phone_short",
        "is_active",
        "last_login",
        "date_joined",
    ]
    list_filter = ["is_active", "is_staff", "signup_source", "setup_status"]
    search_fields = ["email", "name", "business_name", "vapi_assistant_id", "vapi_phone_number"]
    ordering = ["-date_joined"]
    list_editable = ["setup_status"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Profile",
            {
                "fields": (
                    "name",
                    "business_name",
                    "phone_number",
                    "business_type",
                    "service_hours",
                    "custom_service_hours",
                    "signup_source",
                )
            },
        ),
        (
            "Vapi (per-client webhook)",
            {
                "fields": (
                    "vapi_webhook_token",
                    "vapi_webhook_url_display",
                    "vapi_assistant_id",
                    "vapi_phone_number",
                ),
                "description": "1) Generate token → copy Webhook URL. 2) In Vapi, set that URL as the agent's webhook. 3) Optionally store Assistant ID and phone from Vapi here for reference.",
            },
        ),
        (
            "Onboarding",
            {
                "fields": ("setup_status", "admin_notes"),
                "description": "Track setup progress. Admin notes are internal only (not visible to client).",
            },
        ),
        (
            "Settings",
            {"fields": ("currency", "email_notifications", "sms_notifications")},
        ),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Important dates", {"fields": ("date_joined", "last_login")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )

    readonly_fields = ["vapi_webhook_url_display", "date_joined", "last_login"]

    actions = ["generate_vapi_webhook_token", "mark_setup_live"]

    def vapi_phone_short(self, obj: User) -> str:
        if not obj.vapi_phone_number:
            return "—"
        s = obj.vapi_phone_number.strip()
        return s if len(s) <= 16 else s[:13] + "..."
    vapi_phone_short.short_description = "Vapi phone"

    def vapi_token_status(self, obj: User) -> str:
        if obj.vapi_webhook_token:
            return "✓ Set"
        return "—"
    vapi_token_status.short_description = "Vapi token"

    def vapi_webhook_url_display(self, obj: User) -> str:
        if not obj or not obj.vapi_webhook_token:
            return "Generate a token first, then the full URL will appear here."
        path = f"/api/v1/vapi/webhook/{obj.vapi_webhook_token}/"
        return format_html(
            '<code style="background:#f0f0f0;padding:4px 8px;border-radius:4px;">{}</code><br><br>'
            'Use as the webhook URL in this client\'s Vapi agent. Replace the domain with your app URL (e.g. https://yourapp.com).',
            path,
        )
    vapi_webhook_url_display.short_description = "Webhook URL for Vapi"

    @admin.action(description="Generate Vapi webhook token")
    def generate_vapi_webhook_token(self, request, queryset):
        updated = 0
        for user in queryset:
            if not user.vapi_webhook_token:
                user.vapi_webhook_token = secrets.token_urlsafe(32)
                user.setup_status = "token_generated"
                user.save(update_fields=["vapi_webhook_token", "setup_status"])
                updated += 1
        self.message_user(request, f"Generated tokens for {updated} user(s).")

    @admin.action(description="Mark setup status: Live")
    def mark_setup_live(self, request, queryset):
        n = queryset.update(setup_status="live")
        self.message_user(request, f"Marked {n} user(s) as Live.")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.signup_source = "admin"
        super().save_model(request, obj, form, change)
