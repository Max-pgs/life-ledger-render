from django.urls import path

from .views import CommitmentListCreateView, CommitmentDetailView, CommitmentArchiveView

app_name = "commitments"

urlpatterns = [
    path(
        "",
        CommitmentListCreateView.as_view(),
        name = "commitment-list-create",
    ),
    path(
        "<int:pk>/",
        CommitmentDetailView.as_view(),
        name = "commitment-detail",
    ),
    path(
        "<int:pk>/archive/",
        CommitmentArchiveView.as_view(),
        name = "commitment-archive",
    )
]
