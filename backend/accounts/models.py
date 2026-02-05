from __future__ import annotations

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone as django_timezone


class UserManager(BaseUserManager["User"]):
    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model using email as the unique identifier.

    Includes basic business metadata that matches the frontend signup flow.
    """

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)

    # Business metadata from signup
    business_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=50, blank=True)
    business_type = models.CharField(max_length=255, blank=True)
    service_hours = models.CharField(max_length=255, blank=True)
    custom_service_hours = models.CharField(max_length=512, blank=True)
    
    # Vapi: unique token per client so each agent has its own webhook URL
    vapi_webhook_token = models.CharField(
        max_length=64,
        unique=True,
        blank=True,
        help_text="Token for this client's Vapi webhook URL. Leave blank, then use admin action 'Generate Vapi webhook token'. Webhook URL: /api/v1/vapi/webhook/<token>/",
    )
    # Optional: store after you create the agent in Vapi (for your reference only)
    vapi_assistant_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="Vapi Assistant/Agent ID from the Vapi dashboard. For your reference and quick lookup.",
    )
    vapi_phone_number = models.CharField(
        max_length=50,
        blank=True,
        help_text="Phone number assigned to this client's Vapi agent (e.g. +1 555…). For support reference.",
    )

    # Onboarding / setup tracking (for admin use)
    SETUP_STATUS_CHOICES = [
        ("not_started", "Not started"),
        ("token_generated", "Token generated"),
        ("vapi_configured", "Vapi agent configured"),
        ("client_notified", "Client notified"),
        ("live", "Live"),
    ]
    setup_status = models.CharField(
        max_length=32,
        choices=SETUP_STATUS_CHOICES,
        default="not_started",
        help_text="Track onboarding progress for this client.",
    )

    # Internal notes (only visible in admin)
    admin_notes = models.TextField(
        blank=True,
        help_text="Internal notes about this client (not visible to the client).",
    )

    # Account settings
    currency = models.CharField(max_length=8, default='USD', choices=[
        ('USD', 'USD - US Dollar'),
        ('GBP', 'GBP - British Pound'),
        ('AED', 'AED - UAE Dirham'),
        ('SAR', 'SAR - Saudi Riyal'),
        ('PKR', 'PKR - Pakistani Rupee'),
    ])
    email_notifications = models.BooleanField(default=True, help_text='Receive email notifications for bookings and updates')
    sms_notifications = models.BooleanField(default=False, help_text='Receive SMS notifications for bookings')
    sms_webhook_url = models.URLField(
        blank=True,
        help_text=(
            "Optional webhook URL to send alerts for SMS/WhatsApp or other apps. "
            "When SMS notifications are enabled, a POST with alert details will be sent here."
        ),
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=django_timezone.now)

    # Whether the user signed up via the public form (self) or was created in admin (admin).
    # Used to filter "pending" self-signups in admin.
    SIGNUP_SOURCE_CHOICES = [
        ("self", "Self signup"),
        ("admin", "Created by admin"),
    ]
    signup_source = models.CharField(
        max_length=16,
        choices=SIGNUP_SOURCE_CHOICES,
        default="admin",
        help_text="Self signup = registered via the public signup page. Admin = created in Django admin.",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self) -> str:
        return self.email

