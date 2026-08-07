from django.urls import path

from .views import (
    CommitmentListCreateView, 
    CommitmentDetailView, 
    CommitmentGroupListView, 
    CommitmentArchiveView,
    CommitmentTemplateListView,
    UpcomingCommitmentListView,
    OverdueCommitmentListView,
    HighPriorityCommitmentListView,
    ReviewSoonCommitmentListView,
    GuidedSetupView,
    StatusListView,
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
        "statuses/",
        StatusListView.as_view(),
        name = "commitment-status-list",
    ),
    path(
        "upcoming/",
        UpcomingCommitmentListView.as_view(),
        name = "commitment-upcoming",
    ),
    path(
        "overdue/",
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
        "templates/",
        CommitmentTemplateListView.as_view(),
        name = "commitment-template-list",
    ),
    path(
        "guided_setup/",
        GuidedSetupView.as_view(),
        name = "commitment-guided-setup",  
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
