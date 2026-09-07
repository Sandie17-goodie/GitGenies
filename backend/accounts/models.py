"""
OWNER: Person 1 - Auth & User Management
Covers: UC6 (Log In / Authenticate), UC13 (Manage User Accounts)
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with a role, matching the domain model's User class."""

    class Role(models.TextChoices):
        CASHIER = 'CASHIER', 'Cashier'
        INVENTORY_STAFF = 'INVENTORY_STAFF', 'Inventory Staff'
        STORE_MANAGER = 'STORE_MANAGER', 'Store Manager'
        ADMIN = 'ADMIN', 'IT / Admin'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CASHIER)
    is_locked = models.BooleanField(default=False)
    failed_login_attempts = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.username} ({self.role})"
