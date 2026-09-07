"""
OWNER: Person 2 - Catalog & Search
Covers: UC2 (Search Book by ISBN), UC19 (Check Book Availability)
"""
from django.db import models


class Book(models.Model):
    isbn = models.CharField(max_length=20, unique=True, db_index=True)
    title = models.CharField(max_length=255, db_index=True)
    author = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # internal only

    def __str__(self):
        return f"{self.title} ({self.isbn})"
