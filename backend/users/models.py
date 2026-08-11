from django.conf import settings
from django.db import models


class AccountPlan(models.TextChoices):
    FREE = "free", "Free"
    PREMIUM = "premium", "Premium"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "profile",
    )

    plan = models.CharField(
        max_length = 20,
        choices = AccountPlan.choices,
        default = AccountPlan.FREE,
    )

    created_at = models.DateTimeField(
        auto_now_add = True,
    )

    updated_at = models.DateTimeField(
        auto_now = True,
    )

    def __str__(self):
        return f"{self.user.username} profile"