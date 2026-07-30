from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Commitment, CommitmentGroup
from .serializers import CommitmentGroupSerializer, CommitmentSerializer

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
        
class CommitmentDetailView(generics.RetrieveUpdateAPIView):
    # Allow an authenticated user to view or update one commitment.
    
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Restrict access to active commitments owned by the current user.
        
        return Commitment.objects.filter(
            user = self.request.user,
            is_archived = False,
        )
        
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
        
class CommitmentGroupListView(generics.ListAPIView):
    # Return active admin-managed commitment groups.
    
    serializer_class = CommitmentGroupSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return only groups currently available to users.
        
        return CommitmentGroup.objects.filter(
            is_active = True,
        )