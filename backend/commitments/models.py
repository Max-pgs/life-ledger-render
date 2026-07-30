from django.conf import settings
from django.db import models

class CommitmentGroup(models.Model):
    # An admin-managed group used to organise related commitments.
    # The description and external information link are maintained
    # centrally and cannot be edited by ordinary users.
    
    name = models.CharField(
        max_length = 100,
        unique = True,
    )
    
    description = models.TextField(
        blank = True,
    )
    
    information_url = models.URLField(
        blank = True,
    )
    
    is_active = models.BooleanField(
        default = True,
    )
    
    class Meta:
        ordering = ["name"]
        
    def __str__(self):
        return self.name
    
class Status(models.Model):
    # A reusable lifecucle status for comitments records.
    
    name = models.CharField(
        max_length = 100,
        unique = True,
    )
    
    description = models.TextField(
        blank = True,
    )
    
    class Meta:
        ordering = ["name"]
        verbose_name_plural = "statuses"
        
    def __str__(self):
        return self.name

class Commitment(models.Model):
    # A personal life-admin commitment owned by one authenticated user.
    
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "commitments",
    )
    
    group = models.ForeignKey(
        CommitmentGroup,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        related_name = "commitments",
    )
    
    status = models.ForeignKey(
        Status,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        related_name = "commitments",
    )
    
    title = models.CharField(
        max_length = 200,
    )
    
    provider_name = models.CharField(
        max_length = 200,
        blank = True,
    )
    
    due_date = models.DateField(
        null = True,
        blank = True,
    )
    
    renewal_date = models.DateField(
        null = True,
        blank = True,
    )
    
    priority = models.CharField(
        max_length = 10,
        choices = Priority.choices,
        default = Priority.MEDIUM,
    )
    
    notes = models.TextField(
        blank = True
    )
    
    is_archived = models.BooleanField(
        default = False,
    )
    
    archived_at = models.DateTimeField(
        null = True, 
        blank = True,
    )
    
    created_at = models.DateTimeField(
        auto_now = True,
    )
    
    updated_at = models.DateTimeField(
        auto_now = True,
    )
    
    class Meta:
        ordering = ["-created_at"]
        
    def __str__(self):
        return self.title