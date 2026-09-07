from django.urls import path
from .views import SalesReportView, ExportSalesReportCSVView

urlpatterns = [
    path('sales-report/', SalesReportView.as_view(), name='sales-report'),
    path('sales-report/export/csv/', ExportSalesReportCSVView.as_view(), name='sales-report-export-csv'),
]
