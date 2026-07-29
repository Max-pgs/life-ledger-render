from django.urls import path

from .views import CommitmentListCreateView

app_name = "commitments"

urlpatterns = [
    path(
        "",
        CommitmentListCreateView.as_view(),
        name = "commitment-list-create",
    )
]
