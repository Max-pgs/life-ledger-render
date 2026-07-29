from django.contrib import admin

from .models import Commitment

@admin.register(Commitment)
class CommitmentAdmin(admin.ModelAdmin):
    # Admin configuration for inspecting commitment records.
    
    list_display = (
        "id",
        "title",
        "user",
        "is_archived",
        "archived_at",
        "created_at",
        "updated_at",
    )
    
    list_filter = (
        "is_archived",
    )
    
    search_fields = (
        "title",
        "user__username",
        "user__email",
    )
    
    readonly_fields = (
        "created_at",
        "updated_at",
    )