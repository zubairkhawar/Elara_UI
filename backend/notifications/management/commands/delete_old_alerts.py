"""
Delete alerts older than 7 days. Run via cron (e.g. daily) to keep the DB lean.
  python manage.py delete_old_alerts
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from notifications.models import Alert


class Command(BaseCommand):
    help = "Delete alerts older than 7 days"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=7,
            help="Delete alerts older than this many days (default: 7)",
        )

    def handle(self, *args, **options):
        days = options["days"]
        cutoff = timezone.now() - timedelta(days=days)
        deleted, _ = Alert.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(
            self.style.SUCCESS(f"Deleted {deleted} alert(s) older than {days} days.")
        )
