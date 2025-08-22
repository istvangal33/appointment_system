# Business Initialization Methods

This document describes the various ways to initialize businesses in the appointment system with their appropriate time intervals.

## Available Businesses

The system initializes three businesses by default:

1. **Stílus Fodrászat** (Barber/Hairdresser)
   - Slug: `stilus-fodraszat`
   - Time interval: **30 minutes**
   - Services: Professional hair styling for all ages

2. **Harmónia Masszázs Szalon** (Massage Salon)
   - Slug: `harmonia-masszazs` 
   - Time interval: **60 minutes**
   - Services: Relaxing massage and wellness services

3. **Szakértői Tanácsadás** (Expert Consultation)
   - Slug: `szakertoi-tanacsadas`
   - Time interval: **60 minutes**
   - Services: Personalized consultation and expert advice

## Initialization Methods

### 1. Management Command
```bash
# Create all businesses
python manage.py setup_businesses

# Force update existing businesses
python manage.py setup_businesses --force

# Get help
python manage.py setup_businesses --help
```

### 2. Data Migration
Businesses are automatically created when running migrations:
```bash
python manage.py migrate
```
The migration is idempotent and will only create businesses if they don't exist.

### 3. Fixtures
```bash
# Load from fixture file
python manage.py loaddata initial_businesses
```

### 4. Automatic Fallback
The system will automatically create businesses when:
- Accessing any view that requires business data
- No businesses exist in the database

This provides a seamless experience for developers and ensures the system always has basic business data available.

## Technical Notes

- All methods are **idempotent** - they can be run multiple times safely
- Business slugs are used as unique identifiers
- Time intervals are stored in minutes (30 or 60)
- Fallback creation is logged for debugging purposes
- All operations are wrapped in database transactions for consistency

## Development Workflow

For new installations:
1. Run migrations: `python manage.py migrate` (includes data migration)
2. Or run: `python manage.py setup_businesses`
3. Or load fixtures: `python manage.py loaddata initial_businesses`

The system will work correctly with any of these approaches.