from rest_framework import serializers
from .models import Book
from inventory.models import StockEntry


class BookSerializer(serializers.ModelSerializer):
    """Full serializer for staff use (Cashier/Inventory/Manager) - UC2."""
    quantity_on_hand = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ['id', 'isbn', 'title', 'author', 'category', 'price', 'cost_price', 'quantity_on_hand']

    def get_quantity_on_hand(self, obj):
        entry = getattr(obj, 'stock_entry', None)
        return entry.quantity_on_hand if entry else 0


class PublicBookAvailabilitySerializer(serializers.ModelSerializer):
    """
    UC19: public-facing lookup. Deliberately excludes cost_price and any
    internal fields - only exposes an in-stock / out-of-stock indicator,
    per the Iteration 2 special requirements and risk R12.
    """
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ['isbn', 'title', 'author', 'category', 'price', 'in_stock']

    def get_in_stock(self, obj):
        entry = getattr(obj, 'stock_entry', None)
        return bool(entry and entry.quantity_on_hand > 0)
