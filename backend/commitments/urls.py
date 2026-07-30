from django.urls import path

from .views import CommitmentListCreateView, CommitmentDetailView, CommitmentGroupListView, CommitmentArchiveView

app_name = "commitments"

urlpatterns = [
    path(
        "",
        CommitmentListCreateView.as_view(),
        name = "commitment-list-create",
    ),
    path(
        "groups/",
        CommitmentGroupListView.as_view(),
        name = "commitment-group-list",
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
