from django.core.management.base import BaseCommand
from django.db import transaction
from foglalas.models import Business
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Initialize businesses with different time intervals'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of businesses even if they already exist',
        )

    def handle(self, *args, **options):
        """Create default businesses with appropriate time intervals"""
        
        businesses_data = [
            {
                'name': 'Stílus Fodrászat',
                'slug': 'stilus-fodraszat',
                'description': 'Professzionális fodrász szolgáltatások minden korosztály számára.',
                'address': '1052 Budapest, Váci utca 15.',
                'phone': '+36 1 234 5678',
                'email': 'info@stilusfodraszat.hu',
                'time_interval': 30,
            },
            {
                'name': 'Harmónia Masszázs Szalon',
                'slug': 'harmonia-masszazs',
                'description': 'Relaxáló masszázs és wellness szolgáltatások a belvárosban.',
                'address': '1051 Budapest, József Attila utca 12.',
                'phone': '+36 1 345 6789',
                'email': 'info@harmoniamasszazs.hu',
                'time_interval': 60,
            },
            {
                'name': 'Szakértői Tanácsadás',
                'slug': 'szakertoi-tanacsadas',
                'description': 'Személyre szabott konzultáció és szakértői tanácsadás.',
                'address': '1053 Budapest, Kossuth Lajos utca 8.',
                'phone': '+36 1 456 7890',
                'email': 'info@szakertoi-tanacsadas.hu',
                'time_interval': 60,
            }
        ]

        force = options['force']
        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for business_data in businesses_data:
                slug = business_data['slug']
                
                # Check if business already exists
                business, created = Business.objects.get_or_create(
                    slug=slug,
                    defaults=business_data
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Created business: {business.name}')
                    )
                    logger.info(f'Created business: {business.name} (slug: {slug})')
                else:
                    if force:
                        # Update existing business with new data
                        for key, value in business_data.items():
                            if key != 'slug':  # Don't update slug as it's the unique identifier
                                setattr(business, key, value)
                        business.save()
                        updated_count += 1
                        self.stdout.write(
                            self.style.WARNING(f'⚠ Updated business: {business.name}')
                        )
                        logger.info(f'Updated business: {business.name} (slug: {slug})')
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'⚠ Business already exists: {business.name}')
                        )

        # Summary
        if created_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'\nSUCCESS: Created {created_count} new business(es)')
            )
        if updated_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'SUCCESS: Updated {updated_count} existing business(es)')
            )
        if created_count == 0 and updated_count == 0:
            self.stdout.write(
                self.style.WARNING(f'INFO: All businesses already exist. Use --force to update them.')
            )

        # Display current businesses
        self.stdout.write('\nCurrent businesses in database:')
        for business in Business.objects.all().order_by('name'):
            self.stdout.write(
                f'  • {business.name} (slug: {business.slug}, interval: {business.time_interval}min)'
            )