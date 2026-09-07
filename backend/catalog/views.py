"""
OWNER: Person 2 - Catalog & Search
"""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Book
from .serializers import BookSerializer, PublicBookAvailabilitySerializer


class BookViewSet(viewsets.ModelViewSet):
    """Staff-facing catalog + search (UC2). Requires authentication."""
    queryset = Book.objects.select_related('stock_entry').all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(Q(isbn__icontains=q) | Q(title__icontains=q) | Q(author__icontains=q))
        return qs


class PublicAvailabilityViewSet(viewsets.ReadOnlyModelViewSet):
    """UC19: public self-service availability check. No auth required."""
    queryset = Book.objects.select_related('stock_entry').all()
    serializer_class = PublicBookAvailabilitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(Q(isbn__icontains=q) | Q(title__icontains=q) | Q(author__icontains=q))
        return qs
