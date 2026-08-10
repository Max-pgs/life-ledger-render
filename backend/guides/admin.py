from django.contrib import admin

from .models import GroupInformationLink

@admin.register(GroupInformationLink)
class GroupInformationLinkAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "group",
        "is_active",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "group",
        "is_active",
    )

    search_fields = (
        "title",
        "group__name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )