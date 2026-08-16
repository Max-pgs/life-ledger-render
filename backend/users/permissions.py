from rest_framework.permissions import BasePermission

from .models import AccountPlan, UserProfile


class IsPremiumUser(BasePermission):
    message = "This feature is available to Premium users only."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return UserProfile.objects.filter(
            user = request.user,
            plan = AccountPlan.PREMIUM,
        ).exists()