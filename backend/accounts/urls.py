from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MeView

router = DefaultRouter()
router.register('users', UserViewSet, basename='users')
router.register('me', MeView, basename='me')

urlpatterns = router.urls
