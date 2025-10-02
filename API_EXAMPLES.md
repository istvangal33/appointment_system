# API Request Examples

This file contains curl examples for all API endpoints.

## Base URL
```
http://localhost:3001
```

## 1. Health Check

```bash
curl -X GET http://localhost:3001/healthz
```

## 2. Authentication

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@demo.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "owner@demo.com",
    "firstName": "John",
    "lastName": "Owner"
  }
}
```

Save the `accessToken` for subsequent requests.

### Refresh Token
```bash
curl -X POST http://localhost:3001/auth/refresh \
  -b "refreshToken=<refresh-token-from-cookie>"
```

Or let the browser/client handle cookies automatically.

### Logout
```bash
curl -X POST http://localhost:3001/auth/logout
```

## 3. User Profile

### Get Current User
```bash
curl -X GET http://localhost:3001/me \
  -H "Authorization: Bearer <your-access-token>"
```

Response:
```json
{
  "id": "uuid",
  "email": "owner@demo.com",
  "firstName": "John",
  "lastName": "Owner",
  "phone": "+36301234567",
  "memberships": [
    {
      "companyId": "company-uuid",
      "companyName": "Demo Salon",
      "companySlug": "demo-salon",
      "role": "OWNER"
    }
  ]
}
```

Save a `companyId` from the memberships for company-scoped requests.

## 4. Company

### Get Current Company
```bash
curl -X GET http://localhost:3001/companies/current \
  -H "Authorization: Bearer <your-access-token>" \
  -H "X-Company-ID: <company-id>"
```

Or with query parameter:
```bash
curl -X GET "http://localhost:3001/companies/current?companyId=<company-id>" \
  -H "Authorization: Bearer <your-access-token>"
```

Response:
```json
{
  "id": "company-uuid",
  "name": "Demo Salon",
  "slug": "demo-salon",
  "description": "A demo beauty salon for testing",
  "settings": {
    "timezone": "Europe/Budapest",
    "currency": "HUF"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "userRole": "OWNER"
}
```

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "errorCode": "UNAUTHORIZED",
  "message": "Missing or invalid authorization header"
}
```

### 403 Forbidden
```json
{
  "errorCode": "NOT_COMPANY_MEMBER",
  "message": "User is not a member of this company"
}
```

### 404 Not Found
```json
{
  "errorCode": "USER_NOT_FOUND",
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "errorCode": "INTERNAL_ERROR",
  "message": "An error occurred during login"
}
```

## Testing Workflow

1. **Start the server**: `npm run dev`

2. **Login** to get an access token:
   ```bash
   ACCESS_TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"owner@demo.com","password":"password123"}' \
     | jq -r '.accessToken')
   ```

3. **Get user profile** to get company ID:
   ```bash
   COMPANY_ID=$(curl -s http://localhost:3001/me \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     | jq -r '.memberships[0].companyId')
   ```

4. **Access company data**:
   ```bash
   curl -s http://localhost:3001/companies/current \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "X-Company-ID: $COMPANY_ID" \
     | jq '.'
   ```

## Using with HTTPie

If you prefer HTTPie over curl:

```bash
# Login
http POST :3001/auth/login email=owner@demo.com password=password123

# Get user (with token)
http :3001/me "Authorization: Bearer <token>"

# Get company
http :3001/companies/current "Authorization: Bearer <token>" "X-Company-ID: <company-id>"
```

## Using with Postman/Insomnia

Import these requests into Postman or Insomnia:

1. Create a new environment with:
   - `baseUrl`: `http://localhost:3001`
   - `accessToken`: (will be set after login)
   - `companyId`: (will be set after getting user profile)

2. Set up requests with variables:
   - Base URL: `{{baseUrl}}`
   - Authorization header: `Bearer {{accessToken}}`
   - Company header: `{{companyId}}`
