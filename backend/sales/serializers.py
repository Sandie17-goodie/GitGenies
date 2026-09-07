from rest_framework import serializers
from .models import Sale, SaleLineItem, Return, ReturnLineItem


class SaleLineInputSerializer(serializers.Serializer):
    isbn = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)


class ProcessSaleSerializer(serializers.Serializer):
    """UC1 input: cart items + payment method."""
    items = SaleLineInputSerializer(many=True)
    payment_method = serializers.ChoiceField(choices=Sale.PaymentMethod.choices)


class SaleLineItemSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='book.title', read_only=True)
    isbn = serializers.CharField(source='book.isbn', read_only=True)
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = SaleLineItem
        fields = ['id', 'book', 'isbn', 'title', 'quantity', 'unit_price', 'line_total']


class SaleSerializer(serializers.ModelSerializer):
    line_items = SaleLineItemSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(source='cashier.username', read_only=True)

    class Meta:
        model = Sale
        fields = ['id', 'cashier', 'cashier_name', 'date_time', 'total_amount',
                  'payment_method', 'status', 'line_items']
        read_only_fields = ['cashier', 'date_time', 'total_amount', 'status']


class ReturnLineInputSerializer(serializers.Serializer):
    isbn = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)


class ProcessReturnSerializer(serializers.Serializer):
    """UC3 input."""
    sale_id = serializers.IntegerField()
    items = ReturnLineInputSerializer(many=True)
    reason = serializers.CharField(max_length=255)


class ReturnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Return
        fields = ['id', 'sale', 'date_time', 'reason', 'refund_amount', 'processed_by']
        read_only_fields = ['date_time', 'refund_amount', 'processed_by']
