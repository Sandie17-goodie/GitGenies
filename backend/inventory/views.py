"""
OWNER: Person 4 - Inventory
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsInventoryStaffOrAbove
from .models import StockEntry, LowStockAlert, StockAdjustmentLog
from .serializers import StockEntrySerializer, LowStockAlertSerializer, AdjustStockInputSerializer


class StockEntryViewSet(viewsets.ModelViewSet):
    """UC4: Update Inventory."""
    queryset = StockEntry.objects.select_related('book').all()
    serializer_class = StockEntrySerializer
    permission_classes = [IsInventoryStaffOrAbove]

    @action(detail=True, methods=['post'])
    def adjust(self, request, pk=None):
        entry = self.get_object()
        data = AdjustStockInputSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        delta = data.validated_data['delta']
        reason = data.validated_data['reason']
        try:
            if delta >= 0:
                entry.increment(delta)
            else:
                entry.decrement(-delta)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        StockAdjustmentLog.objects.create(
            book=entry.book, changed_by=request.user, delta=delta, reason=reason
        )
        return Response(StockEntrySerializer(entry).data)


class LowStockAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """UC8: Generate Low-Stock Alert (read-only feed for dashboards)."""
    queryset = LowStockAlert.objects.filter(resolved=False).select_related('book')
    serializer_class = LowStockAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
