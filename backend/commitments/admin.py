from django.contrib import admin

from .models import CommitmentGroup, CommitmentTemplate, Commitment, Status

from guides.models import GroupInformationLink

class GroupInformationLinkInline(admin.TabularInline):
    model = GroupInformationLink
    extra = 0

    fields = (
        "title",
        "url",
        "is_active",
        "created_at",
        "updated_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

@admin.register(CommitmentGroup)
class CommitmentGroupAdmin(admin.ModelAdmin):
    # Admin administrators to manage commitment-group guidance.
    
    list_display = (
        "id",
        "name",
        "is_active",
        "last_reviewed_at",
        "updated_at",
    )
    
    list_display_links = (
        "id",
        "name",
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
        "last_reviewed_at",
        "updated_at",
        "is_active",
    )

    readonly_fields = (
        "updated_at",
    )
    
    inlines = (
        GroupInformationLinkInline,
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
    
@admin.register(CommitmentTemplate)
class CommitmentTemplateAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "group",
        "default_payment_frequency",
        "default_priority",
        "is_active",
    )
    
    list_filter = (
        "group",
        "default_payment_frequency",
        "default_priority",
        "is_active",
    )
    
    search_fields = (
        "name",
        "description",
        "default_provider_name",
    )