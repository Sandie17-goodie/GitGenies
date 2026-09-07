from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """UC13: only IT/Admin may manage user accounts."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')


class IsManagerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ('STORE_MANAGER', 'ADMIN'))


class IsInventoryStaffOrAbove(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and
                    request.user.role in ('INVENTORY_STAFF', 'STORE_MANAGER', 'ADMIN'))
