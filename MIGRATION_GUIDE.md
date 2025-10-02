# Migration and Coexistence Guide

This guide explains how the new Node.js/TypeScript backend coexists with the existing Django application and provides a migration path.

## Current Architecture

### Django Backend (`idopontfoglalo/`)
- **Purpose**: Existing appointment booking system
- **Framework**: Django 5.2
- **Database**: PostgreSQL or SQLite
- **Port**: Default Django port (8000)
- **Status**: Fully functional, continues to work

### Node.js Backend (`src/`)
- **Purpose**: New multi-tenant appointment system
- **Framework**: Fastify + Prisma
- **Database**: PostgreSQL
- **Port**: 3001 (configurable)
- **Status**: Ready to use

## Deployment Options

### Option 1: Side-by-Side (Recommended for Gradual Migration)

Both applications run simultaneously on different ports:

```
┌─────────────────────────────────────┐
│         Load Balancer/Reverse Proxy │
│              (nginx/caddy)          │
└─────────────────────────────────────┘
           │                    │
           │                    │
    ┌──────▼──────┐      ┌─────▼──────┐
    │   Django    │      │  Node.js   │
    │   :8000     │      │   :3001    │
    └──────┬──────┘      └─────┬──────┘
           │                    │
           │    ┌──────────┐    │
           └────►PostgreSQL◄────┘
                └──────────┘
```

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Django backend
    location /django/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Node.js backend (API)
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files for Django
    location /static/ {
        alias /path/to/django/static/;
    }
}
```

### Option 2: Separate Databases

Use different PostgreSQL schemas or databases:

```
┌────────────┐     ┌────────────┐
│   Django   │     │  Node.js   │
└─────┬──────┘     └─────┬──────┘
      │                  │
┌─────▼──────┐     ┌─────▼──────┐
│ PostgreSQL │     │ PostgreSQL │
│  Schema:   │     │  Schema:   │
│   django   │     │   public   │
└────────────┘     └────────────┘
```

**Node.js `.env`:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/appointment?schema=public"
```

**Django settings.py:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'appointment',
        'OPTIONS': {'options': '-c search_path=django'},
    }
}
```

### Option 3: Shared Database (Advanced)

Both applications use the same database with different table prefixes:

**Considerations:**
- Django tables keep their existing names
- Node.js/Prisma uses a custom schema or table prefix
- Requires coordination for migrations
- Good for gradual migration

## Migration Strategies

### Strategy 1: Gradual Feature Migration

Migrate features one at a time:

**Phase 1: Authentication**
1. Keep Django auth for existing users
2. Add Node.js auth for new features
3. Gradually migrate users to new auth system

**Phase 2: New Features**
1. Build new multi-tenant features in Node.js
2. Keep existing features in Django
3. Both systems operational

**Phase 3: Data Migration**
1. Create migration scripts
2. Move data incrementally
3. Maintain backward compatibility

**Phase 4: Complete Migration**
1. All features in Node.js
2. Django deprecated gracefully
3. Single system operational

### Strategy 2: API Gateway Pattern

Use Node.js as a gateway to Django:

```javascript
// src/routes/legacy.ts
fastify.all('/legacy/*', async (request, reply) => {
  // Proxy to Django
  const response = await fetch(`http://localhost:8000${request.url}`);
  return reply.send(await response.json());
});
```

### Strategy 3: Parallel Systems

Run both systems independently:
- Django: For existing customers/features
- Node.js: For new multi-tenant system
- No migration needed initially
- Different user bases or use cases

## Data Migration Scripts

### User Migration Example

```typescript
// scripts/migrate-users.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { hashPassword } from '../src/lib/hash';

const prisma = new PrismaClient();
const djangoPool = new Pool({
  connectionString: 'postgresql://...', // Django database
});

async function migrateUsers() {
  // Get users from Django
  const { rows } = await djangoPool.query(`
    SELECT id, email, first_name, last_name, password
    FROM auth_user
  `);

  for (const djangoUser of rows) {
    // Check if already exists
    const exists = await prisma.user.findUnique({
      where: { email: djangoUser.email },
    });

    if (!exists) {
      // Create in new system
      await prisma.user.create({
        data: {
          email: djangoUser.email,
          password: djangoUser.password, // Already hashed
          firstName: djangoUser.first_name,
          lastName: djangoUser.last_name,
        },
      });
      console.log(`Migrated user: ${djangoUser.email}`);
    }
  }
}

migrateUsers();
```

### Appointment Migration Example

```typescript
// scripts/migrate-appointments.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const prisma = new PrismaClient();
const djangoPool = new Pool({
  connectionString: 'postgresql://...', // Django database
});

async function migrateAppointments() {
  // Get appointments from Django
  const { rows } = await djangoPool.query(`
    SELECT 
      a.id,
      a.business_id,
      a.service_type,
      a.name,
      a.phone,
      a.email,
      a.date,
      a.time,
      a.created_at
    FROM foglalas_appointment a
  `);

  for (const appt of rows) {
    // Map to new structure
    const start = new Date(`${appt.date}T${appt.time}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour

    await prisma.appointment.create({
      data: {
        companyId: '...', // Map business_id to company
        customerName: appt.name,
        customerEmail: appt.email,
        customerPhone: appt.phone,
        start,
        end,
        status: 'PENDING',
        createdAt: appt.created_at,
      },
    });
  }
}

migrateAppointments();
```

## Running Both Systems

### Development

**Terminal 1 - Django:**
```bash
cd idopontfoglalo
python manage.py runserver 8000
```

**Terminal 2 - Node.js:**
```bash
npm run dev
# Runs on port 3001
```

### Production

**Using PM2:**
```bash
# Start Django with gunicorn
cd idopontfoglalo
gunicorn idopontfoglalo.wsgi:application --bind 0.0.0.0:8000

# Start Node.js
cd ..
npm run build
npm start
```

**Using Docker Compose:**
```yaml
version: '3.8'
services:
  django:
    build: ./idopontfoglalo
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://...
    depends_on:
      - db

  nodejs:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://...
      - JWT_ACCESS_SECRET=...
      - JWT_REFRESH_SECRET=...
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=appointment_system
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Authentication Bridge

If you need to share authentication between systems:

### JWT Token Sharing

**Django generates JWT for Node.js:**
```python
# Django views.py
import jwt
from django.conf import settings

def create_node_token(user):
    payload = {
        'userId': str(user.id),
        'email': user.email,
    }
    token = jwt.encode(
        payload,
        settings.JWT_ACCESS_SECRET,
        algorithm='HS256'
    )
    return token
```

**Node.js validates Django's JWT:**
```typescript
// Use the same JWT secret in both systems
JWT_ACCESS_SECRET=shared-secret-between-django-and-nodejs
```

### Session Sharing (Advanced)

Use a shared session store (Redis):
```typescript
// Node.js with Redis session
import redis from 'redis';
const client = redis.createClient();

// Check Django session
const sessionKey = request.cookies.sessionid;
const djangoSession = await client.get(`django:session:${sessionKey}`);
```

## Feature Flag System

Control which features use which backend:

```typescript
// config/features.ts
export const features = {
  useNewAuth: process.env.USE_NEW_AUTH === 'true',
  useNewAppointments: process.env.USE_NEW_APPOINTMENTS === 'true',
  useNewCompanyManagement: true, // Always use new
};

// In your routes
if (features.useNewAppointments) {
  // Use Node.js backend
} else {
  // Proxy to Django
}
```

## Monitoring Both Systems

### Health Check Aggregator

```typescript
// src/routes/health.ts
fastify.get('/healthz', async () => {
  const djangoHealth = await fetch('http://localhost:8000/health')
    .then(r => r.ok)
    .catch(() => false);

  return {
    nodejs: 'ok',
    django: djangoHealth ? 'ok' : 'error',
    database: await checkDatabaseConnection(),
  };
});
```

## Best Practices

1. **Start Small**: Begin with new features in Node.js
2. **Keep Django**: Don't break existing functionality
3. **Gradual Migration**: One feature at a time
4. **Test Thoroughly**: Both systems should work independently
5. **Monitor Performance**: Compare both systems
6. **Document Changes**: Keep team informed
7. **Backup Data**: Before any migration
8. **Rollback Plan**: Be ready to revert if needed

## Troubleshooting

### Port Conflicts
```bash
# Check what's using port 3001
lsof -i :3001
# Kill if needed
kill -9 <PID>
```

### Database Connection Issues
```bash
# Test connection
psql postgresql://user:pass@localhost:5432/dbname

# Check active connections
SELECT * FROM pg_stat_activity;
```

### Migration Failures
1. Always backup database first
2. Test migration on staging
3. Run migrations in transaction if possible
4. Have rollback scripts ready

## Conclusion

The new Node.js backend can coexist with Django, providing flexibility for:
- Gradual migration
- A/B testing
- Feature-specific technology choices
- Risk mitigation

Choose the strategy that best fits your timeline, team, and users.
