# Setup Notes

## Current Implementation Status

✅ **Completed:**
- Full Node.js/TypeScript backend structure with Fastify
- Prisma schema with all required models (User, Company, CompanyMembership, Calendar, Service, Appointment, etc.)
- JWT-based authentication with access and refresh tokens
- Multi-tenant company scoping middleware
- Environment variable validation with Zod
- Password hashing with bcrypt (12 salt rounds)
- Seed script with demo data
- ESLint and Prettier configuration
- Comprehensive README documentation

## Testing the Backend

To test the backend, you'll need:

1. **PostgreSQL database** running and accessible
2. Update `.env` file with your database connection string
3. Run the setup commands:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations to create database tables
npm run db:migrate

# Seed the database with demo data
npm run db:seed

# Start the development server
npm run dev
```

## Verifying the Installation

Once the server is running, you can test:

### 1. Health Check
```bash
curl http://localhost:3001/healthz
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@demo.com", "password": "password123"}'
```

Expected response with accessToken and user data.

### 3. Get User Profile
```bash
# Replace <TOKEN> with the accessToken from login
curl http://localhost:3001/me \
  -H "Authorization: Bearer <TOKEN>"
```

Expected response with user data and company memberships.

### 4. Get Company (Company Scope)
```bash
# Replace <TOKEN> and <COMPANY_ID> with actual values
curl http://localhost:3001/companies/current \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Company-ID: <COMPANY_ID>"
```

Expected response with company details.

## Architecture Notes

### Security
- Passwords hashed with bcrypt (12 salt rounds)
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days and stored as HTTPOnly cookies
- TODO: Implement refresh token rotation

### Multi-tenancy
- Company scope validated via middleware
- User must be a member of the company to access company-scoped endpoints
- TODO: Add memory cache for membership validation

### Database Indexes
- `companyId` scope indexes for efficient queries
- `(companyId, start)` index for appointment queries
- `(companyId, role)` index for membership queries
- `(companyId, ownerUserId)` index for calendar queries
- `(companyId, active)` index for service queries

## Next Steps (Roadmap)

### Phase 1: Availability System
- [ ] Working hours calculation
- [ ] Exception handling (holidays, vacations)
- [ ] Real-time availability checking
- [ ] Multi-resource conflict detection

### Phase 2: Advanced Appointments
- [ ] Public booking endpoints (no auth required)
- [ ] Appointment confirmation workflow
- [ ] Email notifications
- [ ] Appointment cancellation/rescheduling

### Phase 3: Services & Resources
- [ ] Service category management
- [ ] Pricing tiers and packages
- [ ] Resource management (rooms, equipment)
- [ ] Service-resource relationships

### Phase 4: Permissions & Security
- [ ] Granular role-based permissions
- [ ] API rate limiting
- [ ] CSRF protection
- [ ] Audit logging

### Phase 5: Integrations
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Payment processing (Stripe, PayPal)
- [ ] SMS notifications
- [ ] Webhook system for third-party integrations

## Code Quality

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Build
```bash
npm run build
```

All code follows ESLint and Prettier rules for consistency.

## Troubleshooting

### Prisma Client Not Generated
If you see errors about `@prisma/client` not having exports, run:
```bash
npm run db:generate
```

### Database Connection Failed
Check your `.env` file has the correct `DATABASE_URL`.

### Port Already in Use
Change the `PORT` in `.env` file or stop the process using port 3001.

## Development Tips

1. Use `npm run dev` for hot-reload during development
2. Use Prisma Studio (`npm run db:studio`) for visual database management
3. Check server logs for detailed error information
4. Use the `/healthz` endpoint to verify server is running
5. Test authentication flow with the provided demo credentials
