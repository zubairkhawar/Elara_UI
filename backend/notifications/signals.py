from __future__ import annotations

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Alert
from .serializers import AlertSerializer
from .stream import push_alert_to_user


@receiver(post_save, sender=Alert)
def on_alert_created(sender, instance: Alert, created: bool, **kwargs) -> None:
    if not created:
        return
    try:
        payload = AlertSerializer(instance).data
        push_alert_to_user(instance.owner_id, payload)
    except Exception:
        pass
