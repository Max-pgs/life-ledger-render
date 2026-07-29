from django.contrib import admin

from .models import Category, Commitment, Status


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    # Admin configuration for commitment categories
    
    list_display = (
        "id",
        "name",
    )
    
    search_fields = (
        "name",
    )
    
@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    # Admin configuration for commitment lifecycle statuses.
    
    list_display = (
        "id",
        "name",
    )
    
    search_fields = (
        "name",
    )

@admin.register(Commitment)
class CommitmentAdmin(admin.ModelAdmin):
    # Admin configuration for commitment records.
    
    list_display = (
        "id",
        "title",
        "user",
        "category",
        "provider_name",
        "due_date",
        "priority",
        "status",
        "is_archived",
        "archived_at",
        "created_at",
        "updated_at",
    )
    
    list_filter = (
        "title",
        "provider_name",
        "user__username",
        "user__email",
    )
    
    search_fields = (
        "title",
        "user__username",
        "user__email",
    )
    
    readonly_fields = (
        "archived_at",
        "created_at",
        "updated_at",
    )