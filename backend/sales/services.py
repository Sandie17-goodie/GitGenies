"""
OWNER: Person 3 - Sales & Checkout
SaleService: the Controller for UC1/UC3/UC17, matching the layered design
and GRASP pattern usage documented in the Elaboration deliverables
(Controller = SaleService, Creator = Sale creating its SaleLineItems,
Information Expert = StockEntry deciding its own quantity changes).
"""
from django.db import transaction
from rest_framework.exceptions import ValidationError
from catalog.models import Book
from inventory.models import StockEntry
from .models import Sale, SaleLineItem, Return, ReturnLineItem, AuditLogEntry


class SaleService:

    @staticmethod
    @transaction.atomic
    def process_sale(cashier, items, payment_method):
        """UC1: Process Sale - single atomic transaction (special requirement)."""
        sale = Sale.objects.create(cashier=cashier, payment_method=payment_method, total_amount=0)
        total = 0
        for item in items:
            try:
                book = Book.objects.select_related('stock_entry').get(isbn=item['isbn'])
            except Book.DoesNotExist:
                raise ValidationError(f"Book with ISBN {item['isbn']} not found")

            entry = getattr(book, 'stock_entry', None)
            if entry is None or entry.quantity_on_hand < item['quantity']:
                raise ValidationError(f"Insufficient stock for {book.title}")

            SaleLineItem.objects.create(
                sale=sale, book=book, quantity=item['quantity'], unit_price=book.price
            )
            entry.decrement(item['quantity'])  # Information Expert
            total += book.price * item['quantity']

        sale.total_amount = total
        sale.save()
        AuditLogEntry.objects.create(
            action_type='SALE', performed_by=cashier, detail=f"Sale #{sale.id} total {total}"
        )
        return sale

    @staticmethod
    @transaction.atomic
    def process_return(processed_by, sale_id, items, reason):
        """UC3: Handle Return / Refund."""
        try:
            sale = Sale.objects.get(id=sale_id, status=Sale.Status.COMPLETED)
        except Sale.DoesNotExist:
            raise ValidationError("Original sale not found or already voided")

        refund_total = 0
        ret = Return.objects.create(sale=sale, reason=reason, refund_amount=0, processed_by=processed_by)
        for item in items:
            try:
                book = Book.objects.select_related('stock_entry').get(isbn=item['isbn'])
                original_line = sale.line_items.get(book=book)
            except (Book.DoesNotExist, SaleLineItem.DoesNotExist):
                raise ValidationError(f"ISBN {item['isbn']} was not part of the original sale")

            line_amount = original_line.unit_price * item['quantity']
            ReturnLineItem.objects.create(
                ret=ret, book=book, quantity=item['quantity'], refund_line_amount=line_amount
            )
            if book.stock_entry:
                book.stock_entry.increment(item['quantity'])  # resalable assumption
            refund_total += line_amount

        ret.refund_amount = refund_total
        ret.save()
        AuditLogEntry.objects.create(
            action_type='RETURN', performed_by=processed_by,
            detail=f"Return #{ret.id} against Sale #{sale.id}, refund {refund_total}"
        )
        return ret

    @staticmethod
    @transaction.atomic
    def void_sale(sale_id, approved_by):
        """
        UC17: Void/Cancel Transaction (Command pattern in the design doc).
        Soft-void: the Sale row is kept, marked VOIDED, stock restored.
        Server-side approval check - never trust the frontend to gate this.
        """
        if approved_by.role not in ('STORE_MANAGER', 'ADMIN'):
            raise ValidationError("Only a Store Manager or Admin can approve a void")

        sale = Sale.objects.select_for_update().get(id=sale_id)
        if sale.status == Sale.Status.VOIDED:
            raise ValidationError("Sale is already voided")

        for line in sale.line_items.all():
            if line.book.stock_entry:
                line.book.stock_entry.increment(line.quantity)

        sale.status = Sale.Status.VOIDED
        sale.voided_by = approved_by
        sale.save()
        AuditLogEntry.objects.create(
            action_type='VOID', performed_by=approved_by, detail=f"Sale #{sale.id} voided"
        )
        return sale
