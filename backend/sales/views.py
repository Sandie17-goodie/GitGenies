"""
OWNER: Person 3 - Sales & Checkout
"""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Sale, Return
from .serializers import (
    SaleSerializer, ProcessSaleSerializer, ReturnSerializer, ProcessReturnSerializer
)
from .services import SaleService


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.prefetch_related('line_items').all().order_by('-date_time')
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head']  # sales are never PUT/DELETEd directly - use void

    def create(self, request, *args, **kwargs):
        """UC1: Process Sale."""
        payload = ProcessSaleSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        sale = SaleService.process_sale(
            cashier=request.user,
            items=payload.validated_data['items'],
            payment_method=payload.validated_data['payment_method'],
        )
        return Response(SaleSerializer(sale).data, status=201)

    @action(detail=True, methods=['post'])
    def void(self, request, pk=None):
        """UC17: Void/Cancel Transaction - requires Manager/Admin approval."""
        sale = SaleService.void_sale(sale_id=pk, approved_by=request.user)
        return Response(SaleSerializer(sale).data)


class ReturnViewSet(viewsets.ModelViewSet):
    queryset = Return.objects.all().order_by('-date_time')
    serializer_class = ReturnSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head']

    def create(self, request, *args, **kwargs):
        """UC3: Handle Return / Refund."""
        payload = ProcessReturnSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        ret = SaleService.process_return(
            processed_by=request.user,
            sale_id=payload.validated_data['sale_id'],
            items=payload.validated_data['items'],
            reason=payload.validated_data['reason'],
        )
        return Response(ReturnSerializer(ret).data, status=201)
