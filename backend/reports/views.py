"""
OWNER: Person 5 - Reports & Database
Covers: UC5 (View Sales Report), UC12 (Export Report CSV/PDF)
"""
import csv
from django.http import HttpResponse
from django.db.models import Sum, F
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsManagerOrAdmin
from sales.models import Sale, SaleLineItem


class SalesReportView(APIView):
    """UC5: View Sales Report - daily revenue + top-selling titles."""
    permission_classes = [IsManagerOrAdmin]

    def get(self, request):
        completed = Sale.objects.filter(status=Sale.Status.COMPLETED)

        daily_revenue = (
            completed.annotate(day=TruncDate('date_time'))
            .values('day')
            .annotate(total=Sum('total_amount'))
            .order_by('day')
        )

        top_titles = (
            SaleLineItem.objects.filter(sale__status=Sale.Status.COMPLETED)
            .values('book__title', 'book__isbn')
            .annotate(units_sold=Sum('quantity'),
                      revenue=Sum(F('quantity') * F('unit_price')))
            .order_by('-units_sold')[:10]
        )

        return Response({
            'daily_revenue': list(daily_revenue),
            'top_titles': list(top_titles),
            'total_revenue': completed.aggregate(total=Sum('total_amount'))['total'] or 0,
        })


class ExportSalesReportCSVView(APIView):
    """UC12: Export Report - generated from the SAME query as the on-screen report."""
    permission_classes = [IsManagerOrAdmin]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="sales_report.csv"'
        writer = csv.writer(response)
        writer.writerow(['Sale ID', 'Date', 'Cashier', 'Total', 'Payment Method', 'Status'])

        for sale in Sale.objects.all().order_by('-date_time'):
            writer.writerow([sale.id, sale.date_time, sale.cashier.username,
                              sale.total_amount, sale.payment_method, sale.status])
        return response
