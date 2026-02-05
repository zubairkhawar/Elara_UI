from __future__ import annotations

import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from .models import User

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=User)
def _store_previous_is_active(sender, instance: User, **kwargs) -> None:
    """Store previous is_active so we can detect activation in post_save."""
    if instance.pk:
        try:
            old = User.objects.get(pk=instance.pk)
            instance._previous_is_active = old.is_active
        except User.DoesNotExist:
            instance._previous_is_active = True
    else:
        instance._previous_is_active = getattr(instance, "is_active", True)


@receiver(post_save, sender=User)
def send_approval_email_on_activation(sender, instance: User, created: bool, **kwargs) -> None:
    """When a user is activated (is_active False → True), send 'your account is live' email."""
    if created:
        return
    previous = getattr(instance, "_previous_is_active", True)
    if previous is True or not instance.is_active:
        return
    # Transition: was inactive, now active → send approval email
    if not instance.email:
        return

    # Only send if email backend is configured (e.g. Gmail)
    if not getattr(settings, "EMAIL_HOST_USER", None):
        logger.info(
            "Skipping approval email for %s: EMAIL_HOST_USER not set",
            instance.email,
        )
        return

    subject = "Your Elara account is ready"
    message = (
        f"Hi {instance.name or 'there'},\n\n"
        "Your Elara AI voice agent has been set up and your account is now active.\n\n"
        "You can log in with the email and password you used when you signed up.\n\n"
        "Next steps:\n"
        "- Log in to your dashboard to view bookings and manage your services.\n"
        "- If we've assigned a phone number for your Vapi agent, you can share it with customers for voice bookings.\n\n"
        "If you have any questions, reply to this email or contact support.\n\n"
        "Welcome to Elara!"
    )
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)
    recipient_list = [instance.email]
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info("Sent approval email to %s", instance.email)
    except Exception:
        logger.exception("Failed to send approval email to %s", instance.email)
        raise
