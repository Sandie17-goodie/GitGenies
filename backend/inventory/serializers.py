from rest_framework import serializers
from .models import StockEntry, LowStockAlert, StockAdjustmentLog


class StockEntrySerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='book.title', read_only=True)
    isbn = serializers.CharField(source='book.isbn', read_only=True)

    class Meta:
        model = StockEntry
        fields = ['id', 'book', 'isbn', 'title', 'quantity_on_hand', 'reorder_threshold', 'last_updated']


class LowStockAlertSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='book.title', read_only=True)
    isbn = serializers.CharField(source='book.isbn', read_only=True)

    class Meta:
        model = LowStockAlert
        fields = ['id', 'book', 'isbn', 'title', 'created_at', 'resolved']


class AdjustStockInputSerializer(serializers.Serializer):
    delta = serializers.IntegerField()
    reason = serializers.CharField(max_length=255)
