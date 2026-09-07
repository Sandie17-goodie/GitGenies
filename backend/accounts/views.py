"""
OWNER: Person 1 - Auth & User Management
UC6  - Log In / Authenticate  -> handled by SimpleJWT's TokenObtainPairView (see core/urls.py)
UC13 - Manage User Accounts   -> UserViewSet below (Admin only)
"""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, CreateUserSerializer
from .permissions import IsAdmin


class UserViewSet(viewsets.ModelViewSet):
    """CRUD for staff accounts. UC13: Admin-only."""
    queryset = User.objects.all().order_by('username')
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateUserSerializer
        return UserSerializer

    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        user = self.get_object()
        user.is_locked = True
        user.is_active = False
        user.save()
        return Response({'status': 'locked'})

    @action(detail=True, methods=['post'])
    def unlock(self, request, pk=None):
        user = self.get_object()
        user.is_locked = False
        user.is_active = True
        user.failed_login_attempts = 0
        user.save()
        return Response({'status': 'unlocked'})


class MeView(viewsets.ViewSet):
    """Returns the logged-in user's own profile - used by the frontend after login."""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        return Response(UserSerializer(request.user).data)
