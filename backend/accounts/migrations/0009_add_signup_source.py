from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0008_user_sms_webhook_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="signup_source",
            field=models.CharField(
                choices=[("self", "Self signup"), ("admin", "Created by admin")],
                default="admin",
                help_text="Self signup = registered via the public signup page. Admin = created in Django admin.",
                max_length=16,
            ),
        ),
    ]
