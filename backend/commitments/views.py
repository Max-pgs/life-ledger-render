from django.utils import timezone
from django.db.models import DateField, ExpressionWrapper, F, Prefetch
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta

from .models import Commitment, CommitmentGroup, CommitmentTemplate, Status
from .serializers import (
    CommitmentGroupSerializer,
    CommitmentSerializer,
    CommitmentTemplateSerializer,
    GuidedSetupGroupSerializer,
    StatusSerializer,
)

class CommitmentListCreateView(generics.ListCreateAPIView):
    # Allow authenticated users to create and view their commitments.
    
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only commitments owned by the authenticated user.
        
        return Commitment.objects.filter(
            user = self.request.user,
            is_archived = False,
        ).order_by("-created_at")
    
    def perform_create(self, serializer):
        # Attach a new commitment to the authenticated user.
        
        serializer.save(user = self.request.user)
        
class ArchivedCommitmentListView(generics.ListAPIView):
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]
    
    # Returns only the current user's archived commitments, newest first.
    def get_queryset(self):
        return Commitment.objects.filter(
            user = self.request.user,
            is_archived = True,
        ).order_by("-archived_at")
        
class CommitmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    # Allow an authenticated user to view or update one commitment.
    
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]
        
    def get_queryset(self):
        return Commitment.objects.filter(
            user=self.request.user,
        )
        
    def update(self, request, *args, **kwargs):
        commitment = self.get_object()

        if commitment.is_archived:
            return Response(
                {
                    "detail": "Archived commitments cannot be edited."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().update(request, *args, **kwargs)


    def destroy(self, request, *args, **kwargs):
        commitment = self.get_object()

        if not commitment.is_archived:
            return Response(
                {
                    "detail": "Only archived commitments can be deleted."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        commitment.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )
        
class UpcomingCommitmentListView(generics.ListAPIView):
    # Return commitments due within the next 30 days.
    
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        today = timezone.localdate()
        upcoming_limit = today + timedelta(days = 30)
        
        return Commitment.objects.filter(
            user = self.request.user,
            is_archived = False,
            due_date__gte = today,
            due_date__lte = upcoming_limit,
        ).order_by("due_date", "created_at")
        
class OverdueCommitmentListView(generics.ListAPIView):
    # Return commitments with due dates earlier than today.
    
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        today = timezone.localdate()
        
        return Commitment.objects.filter(
            user = self.request.user,
            is_archived = False,
            due_date__lt = today,
        ).order_by("due_date", "created_at")
        
class CommitmentArchiveView(APIView):
    # Archive an active commitment owned by the authenticated user.
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        # Mark the commitment as archived instead of deleting it.
        
        try:
            commitment = Commitment.objects.get(
                pk = pk,
                user = request.user,
                is_archived = False,
            )
        except Commitment.DoesNotExist:
            return Response(
                {
                    "detail": "Commitment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )
            
        commitment.is_archived = True
        commitment.archived_at = timezone.now()
        
        commitment.save(
            update_fields = [
                "is_archived",
                "archived_at",
                "updated_at",
            ]
        )
        
        return Response(
            {
                "message": "Commitment archived successfully.",
                "id": commitment.id,
            },
            status = status.HTTP_200_OK,
        )
        
class CommitmentRestoreView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            commitment = Commitment.objects.get(
                pk=pk,
                user=request.user,
                is_archived=True,
            )
        except Commitment.DoesNotExist:
            return Response(
                {
                    "detail": "Archived commitment not found."
                },
                status = status.HTTP_404_NOT_FOUND,
            )

        # Restore the commitment to the active list and clear its archive timestamp.
        commitment.is_archived = False
        commitment.archived_at = None

        commitment.save(
            update_fields = [
                "is_archived",
                "archived_at",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": "Commitment restored successfully.",
                "id": commitment.id,
            },
            status=status.HTTP_200_OK,
        )
        
class CommitmentGroupListView(generics.ListAPIView):
    # Return active admin-managed commitment groups.
    
    serializer_class = CommitmentGroupSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return only groups currently available to users.
        
        return CommitmentGroup.objects.filter(
            is_active = True,
        )
        
class HighPriorityCommitmentListView(generics.ListAPIView):
    # Return active high-priority commitments for the current user.
    
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Commitment.objects.filter(
            user = self.request.user,
            is_archived = False,
            priority = Commitment.Priority.HIGH,
        ).order_by(
            F("due_date").asc(nulls_last = True),
            "created_at",
        )
        
class ReviewSoonCommitmentListView(generics.ListAPIView):
    # Return commitments approaching their cancellation deadline.
    
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        today = timezone.localdate()
        review_limit = today + timedelta(days = 30)
        
        cancellation_deadline = ExpressionWrapper(
            F("contract_end_date") - F("notice_period_days"),
            output_field = DateField(),
        )
        
        return (
            Commitment.objects.filter(
                user = self.request.user,
                is_archived = False,
                contract_end_date__isnull = False,
                notice_period_days__isnull = False,
            ).annotate(
                calculated_cancellation_deadline = cancellation_deadline,
            ).filter(
                calculated_cancellation_deadline__gte = today,
                calculated_cancellation_deadline__lte = review_limit,
            ).order_by(
                "calculated_cancellation_deadline",
                "created_at",
            )
        )
        
class CommitmentTemplateListView(generics.ListAPIView):
    # Return active templates assigned to active commitment groups.
    
    serializer_class = CommitmentTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            CommitmentTemplate.objects
            .filter(
                is_active=True,
                group__is_active=True,
            )
            .select_related("group", "default_status")
            .order_by("group__name", "display_order", "name")
        )
        
class GuidedSetupView(generics.ListAPIView):
    # Return active groups with their available commitment templates.
    
    serializer_class = GuidedSetupGroupSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        active_templates = CommitmentTemplate.objects.filter(
            is_active = True,
        ).order_by("name")
        
        return (
            CommitmentGroup.objects.filter(
                is_active = True,
            ).prefetch_related(
                # Store filtered templates on a separate attribute used by the guided-setup serializer.
                Prefetch(
                    "templates",
                    queryset = active_templates,
                    to_attr = "active_templates",
                )
            ).order_by("name")
        )
        
class StatusListView(generics.ListAPIView):
    # Return admin-managed lifecycle statuses available for commitments.

    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Status.objects.all()