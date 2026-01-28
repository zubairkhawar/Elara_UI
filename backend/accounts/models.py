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

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=django_timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self) -> str:
        return self.email

