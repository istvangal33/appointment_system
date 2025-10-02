# Appointment System - Multi-Tenant Backend

A modern multi-tenant appointment booking system built with Fastify, Prisma, and TypeScript.

## 🚀 Features

- **Multi-tenant architecture** - Support for multiple companies with role-based access
- **JWT Authentication** - Secure authentication with access and refresh tokens
- **RESTful API** - Clean, well-structured API endpoints
- **TypeScript** - Full type safety throughout the codebase
- **Prisma ORM** - Type-safe database access with PostgreSQL
- **Fastify** - High-performance web framework

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/appointment_system?schema=public"
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
PORT=3001
NODE_ENV=development
```

**Important:** 
- JWT secrets must be at least 32 characters long
- Use strong, random secrets in production
- Never commit your `.env` file to version control

### 3. Database Setup

Generate Prisma client:

```bash
npm run db:generate
```

Run database migrations:

```bash
npm run db:migrate
```

Seed the database with demo data:

```bash
npm run db:seed
```

This creates:
- Owner user: `owner@demo.com` / `password123`
- Staff user: `staff@demo.com` / `password123`
- Demo company: "Demo Salon"
- Two personal calendars (one for each user)
- Sample services

### 4. Start the Server

**Quick Start (Automated):**

If you have a PostgreSQL database ready, you can use the automated setup script:

```bash
./start.sh
```

This will:
1. Install dependencies (if needed)
2. Generate Prisma client
3. Run migrations
4. Seed the database
5. Start the development server

**Manual Start:**

Development mode (with hot reload):

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

The server will start on `http://localhost:3001`

## 🧪 Testing the API

Once the server is running, you can test all endpoints with the included test script:

```bash
./test-api.sh
```

This will test:
- Health check endpoint
- Login authentication
- User profile retrieval
- Company-scoped endpoints
- Token refresh
- Logout

Or test manually with curl (see examples below).

## 🔑 Authentication Flow

### 1. Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "owner@demo.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "owner@demo.com",
    "firstName": "John",
    "lastName": "Owner"
  }
}
```

The refresh token is set as an HTTPOnly cookie.

### 2. Use Access Token

Include the access token in the Authorization header:

```bash
GET /me
Authorization: Bearer <accessToken>
```

### 3. Refresh Token

When the access token expires (15 minutes), refresh it:

```bash
POST /auth/refresh
```

The refresh token cookie is automatically sent with the request.

### 4. Logout

```bash
POST /auth/logout
```

This clears the refresh token cookie.

## 📚 API Endpoints

### Public Endpoints

- `GET /healthz` - Health check

### Authentication

- `POST /auth/login` - Login with email and password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (clear refresh token)

### User

- `GET /me` - Get current user with company memberships (requires auth)

### Company

- `GET /companies/current` - Get current company details (requires auth + company scope)

## 🏢 Company Scoping

Protected company endpoints require the company ID in either:

1. **Header**: `X-Company-ID: <companyId>`
2. **Query parameter**: `?companyId=<companyId>`

The middleware validates that the authenticated user is a member of the specified company.

Example:

```bash
GET /companies/current
Authorization: Bearer <accessToken>
X-Company-ID: <companyId>
```

## 🗄️ Database Models

- **User** - System users with email/password authentication
- **Company** - Tenant organizations
- **CompanyMembership** - User-company relationships with roles (OWNER, ADMIN, STAFF, MEMBER)
- **Calendar** - Resource calendars (PERSONAL, RESOURCE, SHARED)
- **Service** - Bookable services with duration and pricing
- **Appointment** - Scheduled appointments with customers
- **AppointmentResource** - Links appointments to calendars
- **WorkingHourTemplate** - Weekly working hours per calendar
- **Exception** - Holidays, vacations, and other calendar exceptions

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔒 Security

### Password Hashing
- Uses bcrypt with 12 salt rounds
- Passwords are never stored in plain text

### JWT Tokens
- **Access Token**: 15-minute expiry, used for API authentication
- **Refresh Token**: 7-day expiry, stored as HTTPOnly cookie

### TODO: Future Improvements
- Implement refresh token rotation for enhanced security
- Add rate limiting
- Implement CSRF protection for cookie-based auth
- Add API key authentication for service-to-service communication

## 🗺️ Roadmap

### Completed ✅
- Multi-tenant database schema
- JWT authentication (v1)
- Company membership and scoping
- Basic endpoint structure

### Next Steps 📝
- **Availability Calculation**
  - Working hours processing
  - Exception handling
  - Conflict detection across multiple resources

- **Advanced Appointment Management**
  - Multi-resource appointment booking
  - Conflict checking improvements
  - Appointment status workflows

- **Public Booking Endpoints**
  - Public-facing booking API
  - Anonymous appointment creation
  - Email confirmations

- **Services UI/API**
  - Service management endpoints
  - Service categories
  - Pricing tiers

- **Role-based Permissions**
  - Granular permission system
  - Role-based endpoint access
  - Company settings management

## 🏗️ Project Structure

```
appointment_system/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
├── src/
│   ├── config/
│   │   └── env.ts          # Environment configuration with Zod validation
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── jwt.ts          # JWT utilities
│   │   └── hash.ts         # Password hashing utilities
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication middleware
│   │   └── companyScope.ts # Company scoping middleware
│   ├── routes/
│   │   ├── auth.ts         # Authentication routes
│   │   ├── me.ts           # User profile routes
│   │   └── company.ts      # Company routes
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   └── server.ts           # Main server file
├── .env.example            # Example environment variables
├── .editorconfig           # Editor configuration
├── .prettierrc             # Prettier configuration
├── eslint.config.mjs       # ESLint configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README_BACKEND.md       # This file
```

## 🤝 Contributing

1. Follow the existing code style (enforced by ESLint and Prettier)
2. Write clear commit messages
3. Update documentation for new features
4. Ensure all tests pass before submitting

## 📄 License

ISC

---

**Note:** This backend is designed to work alongside the existing Django application in the `idopontfoglalo` directory. Both systems can coexist and share the same PostgreSQL database if needed.
