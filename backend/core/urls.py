from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # UC6: Log In / Authenticate
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # One include per team member's app
    path('api/', include('accounts.urls')),   # Person 1
    path('api/', include('catalog.urls')),    # Person 2
    path('api/', include('sales.urls')),      # Person 3
    path('api/', include('inventory.urls')),  # Person 4
    path('api/reports/', include('reports.urls')),  # Person 5
]
