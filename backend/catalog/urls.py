from rest_framework.routers import DefaultRouter
from .views import BookViewSet, PublicAvailabilityViewSet

router = DefaultRouter()
router.register('books', BookViewSet, basename='books')
router.register('availability', PublicAvailabilityViewSet, basename='availability')

urlpatterns = router.urls
