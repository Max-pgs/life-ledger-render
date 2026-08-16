from django.urls import path

from .views import AccountView, DeleteAccountView, RegisterView, LoginView, LogoutView, UpgradeToPremiumView, CancelPremiumView

app_name = "users"

urlpatterns = [
    path("register/", RegisterView.as_view(), name = "register"),
    path("login/", LoginView.as_view(), name = "login"),
    path("logout/", LogoutView.as_view(), name = "logout"),
    path("account/", AccountView.as_view(), name = "account"),
    path("account/delete/", DeleteAccountView.as_view(), name="delete-account"),
    path("account/upgrade/", UpgradeToPremiumView.as_view(), name = "upgrade-account"),
    path("account/cancel-premium/", CancelPremiumView.as_view(), name = "cancel-premium"),
]
