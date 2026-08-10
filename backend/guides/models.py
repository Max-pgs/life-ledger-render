from django.db import models

from commitments.models import CommitmentGroup

# Stores administrator-managed external information links for commitment groups.
# Ordinary users can view these links but cannot modify them.
class GroupInformationLink(models.Model):
    group = models.ForeignKey(
        CommitmentGroup,
        on_delete = models.CASCADE,
        related_name = "information_links",
    )

    title = models.CharField(
        max_length = 150,
    )

    url = models.URLField()

    is_active = models.BooleanField(
        default = True,
    )

    created_at = models.DateTimeField(
        auto_now_add = True,
    )

    updated_at = models.DateTimeField(
        auto_now = True,
    )

    def __str__(self):
        return f"{self.group.name} - {self.title}"