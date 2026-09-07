"""
OWNER: Person 3 - Sales & Checkout
Covers: UC1 (Process Sale), UC3 (Handle Return/Refund), UC17 (Void/Cancel Transaction)
"""
from django.db import models
from django.conf import settings
from catalog.models import Book


class Sale(models.Model):
    class Status(models.TextChoices):
        COMPLETED = 'COMPLETED', 'Completed'
        VOIDED = 'VOIDED', 'Voided'

    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Cash'
        CARD = 'CARD', 'Card'

    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='sales')
    date_time = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.COMPLETED)
    voided_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                   on_delete=models.SET_NULL, related_name='voided_sales')

    def __str__(self):
        return f"Sale #{self.id} - {self.total_amount}"


class SaleLineItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='line_items')
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def line_total(self):
        return self.quantity * self.unit_price


class Return(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.PROTECT, related_name='returns')
    date_time = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=255)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class ReturnLineItem(models.Model):
    ret = models.ForeignKey(Return, on_delete=models.CASCADE, related_name='line_items')
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    refund_line_amount = models.DecimalField(max_digits=10, decimal_places=2)


class AuditLogEntry(models.Model):
    action_type = models.CharField(max_length=50)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    detail = models.TextField(blank=True)
