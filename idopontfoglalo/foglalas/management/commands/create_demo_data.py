from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from foglalas.models import Business, Service, Appointment
from datetime import date, time, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Create demo data for the appointment system'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating demo data...'))

        # Create superadmin user
        if not User.objects.filter(username='superadmin').exists():
            superadmin = User.objects.create_user(
                username='superadmin',
                email='superadmin@example.com',
                password='admin123',
                role='superadmin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(f'Created superadmin user: {superadmin.username}')

        # Create sample businesses
        businesses_data = [
            {
                'name': 'Fodrászat Anna',
                'slug': 'fodraszat-anna',
                'description': 'Professzionális fodrászat a város szívében. Hajvágás, festés, styling.',
                'address': '1051 Budapest, Váci utca 15.',
                'phone': '+36 1 234 5678',
                'email': 'info@fodraszatanna.hu',
                'opening_hours': time(9, 0),
                'closing_hours': time(18, 0)
            },
            {
                'name': 'Wellness Spa Relax',
                'slug': 'wellness-spa-relax',
                'description': 'Teljes körű wellness és spa szolgáltatások. Masszázs, arckezelés, testkezelés.',
                'address': '1052 Budapest, Petőfi Sándor utca 8.',
                'phone': '+36 1 345 6789',
                'email': 'info@wellnessrelax.hu',
                'opening_hours': time(10, 0),
                'closing_hours': time(20, 0)
            }
        ]

        for business_data in businesses_data:
            business, created = Business.objects.get_or_create(
                slug=business_data['slug'],
                defaults=business_data
            )
            if created:
                self.stdout.write(f'Created business: {business.name}')

                # Create admin user for each business
                admin_user = User.objects.create_user(
                    username=f'admin_{business.slug}',
                    email=f'admin@{business.slug}.hu',
                    password='admin123',
                    role='admin',
                    business=business,
                    is_staff=True
                )
                self.stdout.write(f'Created admin user: {admin_user.username} for {business.name}')

                # Create services for each business
                if business.slug == 'fodraszat-anna':
                    services = [
                        {'name': 'Női hajvágás', 'duration': 60},
                        {'name': 'Férfi hajvágás', 'duration': 30},
                        {'name': 'Hajfestés', 'duration': 120},
                        {'name': 'Styling', 'duration': 45}
                    ]
                else:  # wellness-spa-relax
                    services = [
                        {'name': 'Svéd masszázs', 'duration': 60},
                        {'name': 'Aromaterápiás masszázs', 'duration': 90},
                        {'name': 'Arckezelés', 'duration': 75},
                        {'name': 'Testkezelés', 'duration': 120}
                    ]

                for service_data in services:
                    service = Service.objects.create(
                        business=business,
                        name=service_data['name'],
                        duration=service_data['duration']
                    )
                    self.stdout.write(f'Created service: {service.name}')

        # Create a customer user
        if not User.objects.filter(username='customer').exists():
            customer = User.objects.create_user(
                username='customer',
                email='customer@example.com',
                password='customer123',
                role='customer'
            )
            self.stdout.write(f'Created customer user: {customer.username}')

        # Create sample appointments
        businesses = Business.objects.all()
        for business in businesses:
            services = business.service_set.all()
            for i in range(3):
                appointment_date = date.today() + timedelta(days=i+1)
                appointment_time = time(10 + i*2, 0)  # 10:00, 12:00, 14:00
                
                appointment = Appointment.objects.create(
                    business=business,
                    name=f'Teszt Ügyfél {i+1}',
                    phone=f'+36 30 123 456{i}',
                    email=f'test{i+1}@example.com',
                    date=appointment_date,
                    time=appointment_time,
                    service=services.first() if services else None,
                    status='pending'
                )
                self.stdout.write(f'Created appointment: {appointment.name} for {business.name}')

        self.stdout.write(self.style.SUCCESS('Demo data created successfully!'))
        self.stdout.write('')
        self.stdout.write('Demo users:')
        self.stdout.write('- superadmin/admin123 (Superadmin)')
        self.stdout.write('- admin_fodraszat-anna/admin123 (Admin for Fodrászat Anna)')
        self.stdout.write('- admin_wellness-spa-relax/admin123 (Admin for Wellness Spa)')
        self.stdout.write('- customer/customer123 (Customer)')