from django.urls import path

from .views import (
    CommitmentListCreateView, 
    CommitmentDetailView, 
    CommitmentGroupListView, 
    CommitmentArchiveView,
    UpcomingCommitmentListView,
    OverdueCommitmentListView,
    HighPriorityCommitmentListView,
    ReviewSoonCommitmentListView,
)

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
        "upcoming/",
        UpcomingCommitmentListView.as_view(),
        name = "commitment-upcoming",
    ),
    path(
        "ovedue/",
        OverdueCommitmentListView.as_view(),
        name = "commitment-overdue",
    ),
    path(
      "high-priority/",
      HighPriorityCommitmentListView.as_view(),
      name = "commitment-high-priority",  
    ),
    path(
      "review-soon/",
      ReviewSoonCommitmentListView.as_view(),
      name = "commitment-review-soon",  
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
