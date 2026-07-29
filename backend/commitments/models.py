from django.conf import settings
from django.db import models

class Commitment(models.Model):
    # A personal life-admin commitment owned by one authenticated user.
    # Additional structured fields such as category, provider, dates,
    # priority and status will be introduced in later user stories.

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "commitments",
    )
    
    title = models.CharField(max_length = 200)
    
    notes = models.TextField(blank = True)
    
    is_archived = models.BooleanField(default = False)
    
    archived_at = models.DateTimeField(null = True, blank = True)
    
    created_at = models.DateTimeField(auto_now = True)
    
    updated_at = models.DateTimeField(auto_now = True)
    
    class Meta:
        ordering = ["-created_at"]
        
    def __str__(self):
        return self.title