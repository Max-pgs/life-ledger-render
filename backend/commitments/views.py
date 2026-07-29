from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Commitment
from .serializers import CommitmentSerializer

class CommitmentListCreateView(generics.ListCreateAPIView):
    # Allow authenticated users to create and view their commitments.
    
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only commitments owned by the authenticated user.
        
        return Commitment.objects.filter(user = self.request.user)
    
    def perform_create(self, serializer):
        # Attach a new commitment to the authenticated user.
        
        serializer.save(user = self.request.user)
        
class CommitmentDetailView(generics.RetrieveUpdateAPIView):
    # Allow an authenticated user to view or update one commitment.
    
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Restrict access to commitments owned by the current user.
        
        return Commitment.objects.filter(
            user = self.request.user,
        )