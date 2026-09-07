from django.contrib import admin
from .models import StockEntry, LowStockAlert, StockAdjustmentLog

admin.site.register(StockEntry)
admin.site.register(LowStockAlert)
admin.site.register(StockAdjustmentLog)
