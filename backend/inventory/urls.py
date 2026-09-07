from rest_framework.routers import DefaultRouter
from .views import StockEntryViewSet, LowStockAlertViewSet

router = DefaultRouter()
router.register('stock', StockEntryViewSet, basename='stock')
router.register('alerts', LowStockAlertViewSet, basename='alerts')

urlpatterns = router.urls
