from django.contrib import admin
from .models import Sale, SaleLineItem, Return, ReturnLineItem, AuditLogEntry

admin.site.register(Sale)
admin.site.register(SaleLineItem)
admin.site.register(Return)
admin.site.register(ReturnLineItem)
admin.site.register(AuditLogEntry)
