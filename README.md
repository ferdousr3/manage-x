# Manage-X API

A lightweight REST API built with **Hono**, **Drizzle ORM**, and **PostgreSQL** for managing posts, products, clients, and groups.

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-4.x-E36002?logo=hono&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?logo=vercel&logoColor=white)

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- pnpm (recommended) or npm
- PostgreSQL database (local or Neon)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/manage-x.git
cd manage-x

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The API will be available at `http://localhost:3000`

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | `your-secret-key` |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | `your-refresh-secret` |
| `EMAIL_RESEND_API_KEY` | Resend API key for emails | `re_xxxxx` |
| `EMAIL_SENDER_EMAIL` | Sender email address | `noreply@yourdomain.com` |

---

## 📖 API Documentation

### Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://your-app.vercel.app/api/v1
```

### Swagger UI

Interactive API documentation available at: `/docs`

---

## 🔥 Stoker - Response Utilities

This API uses [**stoker**](https://github.com/w3cj/stoker) - a utility library for Hono and @hono/zod-openapi providing standardized HTTP status codes, response helpers, and OpenAPI schemas.

### Installation

```bash
pnpm add stoker
```

### HTTP Status Codes

Use typed HTTP status codes instead of magic numbers:

```typescript
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

// Instead of: c.json({ message: "Not Found" }, 404)
// Use:
c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
```

**Available Status Codes:**

| Constant | Value | Description |
|----------|-------|-------------|
| `OK` | 200 | Request succeeded |
| `CREATED` | 201 | Resource created |
| `NO_CONTENT` | 204 | No content to return |
| `BAD_REQUEST` | 400 | Invalid request |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `UNPROCESSABLE_ENTITY` | 422 | Validation error |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### Response Helpers

#### jsonContent

Create OpenAPI response schemas easily:

```typescript
import jsonContent from "stoker/openapi/helpers/json-content";
import { z } from "@hono/zod-openapi";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
});

// Use in route responses
responses: {
  [HttpStatusCodes.OK]: jsonContent(UserSchema, "User retrieved successfully"),
}
```

#### jsonContentRequired

For required request body schemas:

```typescript
import jsonContentRequired from "stoker/openapi/helpers/json-content-required";

request: {
  body: jsonContentRequired(CreateUserSchema, "User data"),
}
```

### OpenAPI Schemas

#### ID Params Schema

Validate path parameters:

```typescript
import IdParamsSchema from "stoker/openapi/schemas/id-params";
// Validates: { id: number }

import IdUUIDParamsSchema from "stoker/openapi/schemas/id-uuid-params";
// Validates: { id: uuid }

import getParamsSchema from "stoker/openapi/schemas/get-params-schema";
// Custom: getParamsSchema({ name: "userId", validator: "nanoid" })
```

#### Message Object Schema

Create standardized message responses:

```typescript
import createMessageObjectSchema from "stoker/openapi/schemas/create-message-object";

// Response: { message: "User created successfully" }
responses: {
  [HttpStatusCodes.CREATED]: jsonContent(
    createMessageObjectSchema("User created successfully"),
    "Success message"
  ),
}
```

#### Error Schema

Generate validation error schemas:

```typescript
import createErrorSchema from "stoker/openapi/schemas/create-error-schema";

// Creates error schema with example Zod validation messages
responses: {
  [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
    createErrorSchema(UserSchema),
    "Validation error"
  ),
}
```

### Default Hook

Handle validation errors automatically:

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "stoker/openapi";

const app = new OpenAPIHono({ defaultHook });

// Validation errors automatically respond with:
// Status: 422
// Body: { success: false, error: { ZodError details } }
```

### Middlewares

#### Not Found Handler

```typescript
import { notFound } from "stoker/middlewares";

app.notFound(notFound);
// Returns: { message: "Not Found - /path" }
```

#### Error Handler

```typescript
import { onError } from "stoker/middlewares";

app.onError(onError);
// Returns: { message: "Error message" } with appropriate status
```

#### Emoji Favicon

```typescript
import { serveEmojiFavicon } from "stoker/middlewares";

app.use(serveEmojiFavicon("🚀"));
```

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Register

Create a new user account.

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "id": "a1b2c3d4e5",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "verified": false,
    "createdAt": "2025-12-05T08:00:00.000Z"
  }
}
```

---

### Login

Authenticate and receive access tokens.

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "a1b2c3d4e5",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### Refresh Token

Get a new access token using refresh token.

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Change Password

Change password for authenticated user.

```http
POST /api/v1/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Forgot Password

Request a password reset email.

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Reset Password

Reset password using token from email.

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "newSecurePassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Verify Email

Verify user email address.

```http
GET /api/v1/auth/verify-email?token=verification-token
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 📝 Posts

CRUD operations for posts.

### List Posts

```http
GET /api/v1/posts?page=1&limit=10
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search by title |
| `published` | boolean | - | Filter by published status |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "p1a2b3c4d5",
      "title": "My First Post",
      "content": "This is the content...",
      "published": true,
      "authorId": "a1b2c3d4e5",
      "createdAt": "2025-12-05T08:00:00.000Z",
      "updatedAt": "2025-12-05T08:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### Get Post

```http
GET /api/v1/posts/:id
Authorization: Bearer <access_token>
```

---

### Create Post

```http
POST /api/v1/posts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "My New Post",
  "content": "This is the post content...",
  "published": false
}
```

---

### Update Post

```http
PUT /api/v1/posts/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "published": true
}
```

---

### Delete Post

```http
DELETE /api/v1/posts/:id
Authorization: Bearer <access_token>
```

---

## 📦 Products

CRUD operations for products.

### List Products

```http
GET /api/v1/products?page=1&limit=10
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search by name |
| `minPrice` | number | - | Minimum price filter |
| `maxPrice` | number | - | Maximum price filter |

---

### Get Product

```http
GET /api/v1/products/:id
Authorization: Bearer <access_token>
```

---

### Create Product

```http
POST /api/v1/products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description...",
  "price": 99.99,
  "stock": 100,
  "image": "https://example.com/image.jpg"
}
```

---

### Update Product

```http
PUT /api/v1/products/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 149.99,
  "stock": 50
}
```

---

### Delete Product

```http
DELETE /api/v1/products/:id
Authorization: Bearer <access_token>
```

---

## 👥 Clients

CRUD operations for clients.

### List Clients

```http
GET /api/v1/clients?page=1&limit=10
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search by name/email |
| `groupId` | string | - | Filter by group |

---

### Get Client

```http
GET /api/v1/clients/:id
Authorization: Bearer <access_token>
```

---

### Create Client

```http
POST /api/v1/clients
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "company": "Client Company",
  "groupId": "g1a2b3c4d5"
}
```

---

### Update Client

```http
PUT /api/v1/clients/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Client Name",
  "phone": "+0987654321"
}
```

---

### Delete Client

```http
DELETE /api/v1/clients/:id
Authorization: Bearer <access_token>
```

---

## 👨‍👩‍👧‍👦 Groups

CRUD operations for groups.

### List Groups

```http
GET /api/v1/groups?page=1&limit=10
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search by name |

---

### Get Group

```http
GET /api/v1/groups/:id
Authorization: Bearer <access_token>
```

---

### Create Group

```http
POST /api/v1/groups
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "My Group",
  "description": "Group description..."
}
```

---

### Update Group

```http
PUT /api/v1/groups/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Group Name",
  "description": "Updated description..."
}
```

---

### Delete Group

```http
DELETE /api/v1/groups/:id
Authorization: Bearer <access_token>
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User doesn't have permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Generate database migrations
pnpm db:generate

# Push schema to database
pnpm db:push

# Open Drizzle Studio (GUI for database)
pnpm db:studio

# Format code
pnpm format

# Lint code
pnpm lint
```

---

## 🚀 Deployment

### Netlify

This API is configured for deployment on Netlify using serverless functions.

#### Prerequisites

- Netlify account
- Netlify CLI (optional, for CLI deployment)

#### Deploy via Netlify Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider and select the repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Functions directory: `netlify/functions`
   - Node version: 22 (automatically detected from `.nvmrc`)

4. **Add Environment Variables**
   Go to Site settings → Environment variables and add:
   - `DATABASE_URL`
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`
   - `EMAIL_RESEND_API_KEY`
   - `EMAIL_SENDER_EMAIL`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

5. **Deploy!**
   - Click "Deploy site"
   - Your API will be available at `https://your-site-name.netlify.app`

#### Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site (first time only)
netlify init

# Set environment variables
netlify env:set DATABASE_URL "your-database-url"
netlify env:set ACCESS_TOKEN_SECRET "your-secret"
netlify env:set REFRESH_TOKEN_SECRET "your-refresh-secret"
netlify env:set EMAIL_RESEND_API_KEY "your-resend-key"
netlify env:set EMAIL_SENDER_EMAIL "noreply@yourdomain.com"
netlify env:set FRONTEND_URL "https://your-frontend.netlify.app"
netlify env:set NODE_ENV "production"

# Deploy to production
netlify deploy --prod
```

#### Testing Your Deployment

After deployment, test your API:

```bash
# Root endpoint (should show "Server Running" page)
curl https://your-site-name.netlify.app

# Health check
curl https://your-site-name.netlify.app/health

# API documentation
# Visit: https://your-site-name.netlify.app/docs
```

#### Troubleshooting

**Build fails:**
- Check that Node version 22 is specified in `.nvmrc`
- Verify all dependencies are in `package.json`
- Check build logs in Netlify dashboard

**Function errors:**
- Verify environment variables are set correctly
- Check function logs in Netlify dashboard
- Ensure database is accessible from Netlify's servers

**CORS issues:**
- Update `FRONTEND_URL` environment variable with your frontend domain
- Redeploy after changing environment variables


### Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
