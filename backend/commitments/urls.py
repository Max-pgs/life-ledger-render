from django.urls import path

from .views import CommitmentCreateView

app_name = "commitments"

urlpatterns = [
    path(
        "",
        CommitmentCreateView.as_view(),
        name = "commitment-create",
    )
]
