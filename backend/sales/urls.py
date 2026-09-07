from rest_framework.routers import DefaultRouter
from .views import SaleViewSet, ReturnViewSet

router = DefaultRouter()
router.register('sales', SaleViewSet, basename='sales')
router.register('returns', ReturnViewSet, basename='returns')

urlpatterns = router.urls
