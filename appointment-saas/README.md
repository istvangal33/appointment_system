# Multi-Tenant Appointment Booking System

A modern, multi-tenant SaaS solution for appointment booking built with Next.js, Prisma, and TypeScript. Extracted and refactored from the original Django-based gyogytorna_site system.

## Features

### User-Facing Features
- **Booking Form**: Simple form with name, email, and optional phone
- **Real-time Availability**: Dynamic time slot checking
- **Email Confirmation**: Automatic confirmation emails with ICS calendar attachments
- **Cancellation System**: Easy cancellation via email links with unique tokens

### Admin Dashboard
- **Appointment Management**: Complete CRUD operations for appointments
- **Search & Filtering**: Filter by status, date range, customer details
- **Status Management**: Update appointment status (active, cancelled, completed, no_show)
- **CSV Export**: Export appointments data (daily/weekly)

### Multi-Tenant Architecture
- **Tenant Isolation**: Each business operates independently
- **Custom Branding**: Per-tenant customization options
- **Scalable Design**: Ready for SaaS deployment

### Notification System
- **Email Service**: Resend integration for reliable email delivery
- **ICS Generation**: Calendar file attachments for appointments
- **SMS/Viber Ready**: Feature-flagged for future implementation

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: Prisma with SQLite (easily switchable to PostgreSQL)
- **Styling**: Tailwind CSS
- **Email**: Resend service
- **Calendar**: ICS file generation

## Quick Start

### 1. Installation

```bash
git clone <repository-url>
cd appointment-saas
npm install
```

### 2. Environment Setup

Create a `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# Email service (Resend)
RESEND_API_KEY="your-resend-api-key"

# SMS/Viber (placeholder for future implementation)
SMS_ENABLED=false
VIBER_ENABLED=false

# Application
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# App configuration
APP_NAME="Appointment Booking System"
APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client and create database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## Demo Businesses

After seeding, you can access these demo businesses:

### Booking Pages:
- Harmony Massage: http://localhost:3000/harmony-massage
- Style Barber: http://localhost:3000/style-barber  
- Expert Consulting: http://localhost:3000/expert-consulting

### Admin Dashboards:
- Harmony Massage Admin: http://localhost:3000/admin/harmony-massage
- Style Barber Admin: http://localhost:3000/admin/style-barber
- Expert Consulting Admin: http://localhost:3000/admin/expert-consulting

## API Endpoints

### Appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - List appointments (admin)
- `POST /api/appointments/cancel` - Cancel appointment
- `PATCH /api/appointments/[id]/status` - Update appointment status
- `GET /api/appointments/export` - Export appointments as CSV

### Time Slots
- `GET /api/appointments/slots` - Get available time slots

### Tenants
- `GET /api/tenants/[slug]` - Get tenant information

## Migration from Django System

This Next.js system is a complete refactor of the original Django appointment system with these improvements:

- **Modern Stack**: Next.js + TypeScript vs Django + Python
- **Multi-Tenancy**: Built-in SaaS architecture
- **Better UX**: React-based interactive UI
- **Email Integration**: Proper ICS calendar support
- **Admin Dashboard**: Advanced filtering and export features
- **Scalability**: Designed for cloud deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
