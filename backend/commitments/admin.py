from django.contrib import admin

from .models import CommitmentGroup, Commitment, Status


@admin.register(CommitmentGroup)
class CommitmentGroupAdmin(admin.ModelAdmin):
    # Admin administrators to manage commitment-group guidance.
    
    list_display = (
        "id",
        "name",
        "is_active",
        "information_url",
    )
    
    list_filter = (
        "is_active",
    )
    
    search_fields = (
        "name",
        "description",
    )
    
    fields = (
        "name",
        "description",
        "information_url",
        "is_active",
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
        "description",
    )

@admin.register(Commitment)
class CommitmentAdmin(admin.ModelAdmin):
    # Admin configuration for commitment records.
    
    list_display = (
        "id",
        "title",
        "user",
        "group",
        "provider_name",
        "amount",
        "payment_frequency",
        "payment_status",
        "contract_end_date",
        "notice_period_days",
        "due_date",
        "priority",
        "status",
        "is_archived",
        "created_at",
    )
    
    list_filter = (
        "group",
        "payment_frequency",
        "payment_status",
        "priority",
        "status",
        "is_archived",
    )
    
    search_fields = (
        "title",
        "provider_name",
        "user__username",
        "user__email",
    )
    
    readonly_fields = (
        "archived_at",
        "created_at",
        "updated_at",
    )