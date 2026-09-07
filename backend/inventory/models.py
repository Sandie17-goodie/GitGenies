"""
OWNER: Person 4 - Inventory
Covers: UC4 (Update Inventory), UC8 (Generate Low-Stock Alert)
Implements the Observer pattern from the Iteration 2 design class diagram:
StockEntry notifies LowStockAlertService whenever its quantity changes.
"""
from django.db import models
from catalog.models import Book


class StockEntry(models.Model):
    book = models.OneToOneField(Book, on_delete=models.CASCADE, related_name='stock_entry')
    quantity_on_hand = models.IntegerField(default=0)
    reorder_threshold = models.IntegerField(default=5)
    last_updated = models.DateTimeField(auto_now=True)

    def is_below_threshold(self):
        return self.quantity_on_hand <= self.reorder_threshold

    def decrement(self, qty):
        if self.quantity_on_hand - qty < 0:
            raise ValueError("Cannot reduce stock below zero")
        self.quantity_on_hand -= qty
        self.save()
        notify_stock_observers(self)

    def increment(self, qty):
        self.quantity_on_hand += qty
        self.save()
        notify_stock_observers(self)

    def __str__(self):
        return f"{self.book.title}: {self.quantity_on_hand} on hand"


class LowStockAlert(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='alerts')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']


class StockAdjustmentLog(models.Model):
    """Audit trail for every manual stock change (UC4 special requirement)."""
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    changed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    delta = models.IntegerField()
    reason = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)


def notify_stock_observers(stock_entry: StockEntry):
    """UC8: Observer pattern - react to every stock change."""
    if stock_entry.is_below_threshold():
        LowStockAlert.objects.get_or_create(book=stock_entry.book, resolved=False)
    else:
        LowStockAlert.objects.filter(book=stock_entry.book, resolved=False).update(resolved=True)
