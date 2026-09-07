"""
OWNER: Person 5 - Reports & Database (shared seed script for tomorrow's demo)
Run with: python manage.py seed_demo
Creates one login per role plus a small book catalog with stock, so the
whole team can log in and demo their own use cases immediately.
"""
from django.core.management.base import BaseCommand
from accounts.models import User
from catalog.models import Book
from inventory.models import StockEntry


class Command(BaseCommand):
    help = "Seed demo users and a sample book catalog for the presentation."

    def handle(self, *args, **options):
        demo_users = [
            ('cashier1', 'CASHIER'),
            ('inventory1', 'INVENTORY_STAFF'),
            ('manager1', 'STORE_MANAGER'),
            ('admin1', 'ADMIN'),
        ]
        for username, role in demo_users:
            user, created = User.objects.get_or_create(
                username=username, defaults={'role': role, 'is_staff': role == 'ADMIN'}
            )
            user.set_password('demo1234')
            user.role = role
            user.save()
            self.stdout.write(f"User '{username}' / password 'demo1234' -> role {role}")

        books = [
            ('9780132350884', 'Clean Code', 'Robert C. Martin', 'Software Engineering', 45.00, 12),
            ('9780201633610', 'Design Patterns', 'Gang of Four', 'Software Engineering', 55.00, 3),
            ('9780321125217', 'Domain-Driven Design', 'Eric Evans', 'Software Engineering', 60.00, 0),
            ('9780134685991', 'Effective Java', 'Joshua Bloch', 'Programming', 40.00, 20),
            ('9780262033848', 'Introduction to Algorithms', 'CLRS', 'Computer Science', 70.00, 8),
        ]
        for isbn, title, author, category, price, qty in books:
            book, _ = Book.objects.get_or_create(
                isbn=isbn, defaults={'title': title, 'author': author,
                                      'category': category, 'price': price, 'cost_price': price * 0.6}
            )
            StockEntry.objects.get_or_create(book=book, defaults={'quantity_on_hand': qty, 'reorder_threshold': 5})

        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully.'))
