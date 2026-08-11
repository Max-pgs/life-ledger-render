from django.db import models

from commitments.models import CommitmentGroup

# Information links are administrator-managed and read-only for ordinary users.
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