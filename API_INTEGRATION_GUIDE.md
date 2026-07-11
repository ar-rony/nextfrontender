# Vercel Postgres API Integration Guide

## Quick Start

### Prerequisites
✅ `@vercel/postgres` installed
✅ `POSTGRES_URL` environment variable configured
✅ Database table created with schema

### Database Schema (SQL)
```sql
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### GET /api/projects
Retrieves all projects from the database.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Project",
      "description": "Project description",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Response (500):**
```json
{
  "error": "Failed to retrieve projects",
  "details": "connection refused",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "uuid-here"
}
```

---

### POST /api/projects
Creates a new project in the database.

**Request:**
```javascript
// Example frontend call
const response = await fetch("/api/projects", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Aurora Studio",
    description: "A premium portfolio and content experience for a design-led studio."
  }),
});

const result = await response.json();

if (response.ok) {
  console.log("Project created:", result.data);
  // result.data = { id: 1, name: "Aurora Studio", description: "...", created_at: "..." }
} else {
  console.error("Error:", result.error);
  // result.error = "Validation failed"
  // result.details = "\"name\" field is required"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 1,
    "name": "Aurora Studio",
    "description": "A premium portfolio and content experience...",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response (400 - Validation):**
```json
{
  "error": "Validation failed",
  "details": "\"name\" field is required",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "uuid-here"
}
```

**Error Response (500 - Database):**
```json
{
  "error": "Failed to create project",
  "details": "connect ECONNREFUSED 127.0.0.1:5432",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "uuid-here"
}
```

---

## Key Features of the API Route

### 1. **Request Validation**
- Validates that `name` and `description` are provided
- Checks that both fields are non-empty strings
- Enforces max length constraints (name: 255 chars, description: 5000 chars)
- Returns 400 status with specific error messages for invalid data

### 2. **Parameterized Queries**
```typescript
// ✅ SAFE - Using parameterized query (prevents SQL injection)
const result = await sql`
  INSERT INTO projects (name, description, created_at)
  VALUES (${name}, ${description}, NOW())
  RETURNING id, name, description, created_at
`;

// ❌ UNSAFE - String concatenation (vulnerable to SQL injection)
const result = await sql(`
  INSERT INTO projects (name, description, created_at)
  VALUES ('${name}', '${description}', NOW())
  RETURNING id, name, description, created_at
`);
```

### 3. **Comprehensive Error Handling**
- Detects connection timeouts (503 Service Unavailable)
- Detects connection refused errors (ECONNREFUSED)
- Detects constraint violations
- All errors include requestId for tracing in logs

### 4. **Disable Caching with noStore()**
```typescript
import { unstable_noStore as noStore } from 'next/cache';

export async function POST(request: NextRequest) {
  noStore(); // Ensures new projects appear immediately
  // ... rest of code
}
```

### 5. **Detailed Logging**
Every request logs:
- Unique request ID (UUID) for tracing
- Timestamp of request
- Request content-type
- SQL query being executed
- Success/failure status
- Error messages and stack traces

Check these logs in:
- **Local dev:** Terminal output
- **Vercel deployed:** Runtime Logs (not Build Logs)

---

## Debugging Checklist

### ✅ Before Testing Locally

```bash
# 1. Pull environment variables from Vercel
npx vercel env pull .env.local

# 2. Verify POSTGRES_URL is in .env.local
cat .env.local | grep POSTGRES_URL

# 3. Restart your dev server
npm run dev
# or
pnpm dev
```

### ✅ Common Issues & Solutions

**Issue: "POSTGRES_URL is undefined"**
```
❌ Reason: Environment variables not loaded
✅ Solution: 
  1. Run: npx vercel env pull .env.local
  2. Restart dev server
  3. Check .env.local exists and contains POSTGRES_URL
```

**Issue: "Failed to create project" but no error in console**
```
❌ Reason: Looking at wrong logs
✅ Solution:
  1. Check Terminal output (local) or Runtime Logs (Vercel)
  2. Look for [requestId] logs
  3. Copy requestId from response and search logs for it
  4. Go to Vercel Dashboard > Deployments > Runtime Logs (not Build Logs)
```

**Issue: "Connection timeout" or "connection pool exhausted"**
```
❌ Reason: Cold start or connection pool at max
✅ Solution:
  1. Retry the request (cold start issue)
  2. Check max_pool_size in POSTGRES_URL
  3. Use Vercel Postgres with connection pooling built-in
  4. Consider reducing concurrent database connections
```

**Issue: Data inserted successfully (201) but no row appears**
```
❌ Reason: Frontend caching the old data
✅ Solution:
  1. noStore() is already in the API route
  2. Call fetchProjects() after successful POST
  3. Check browser DevTools Network tab
  4. Clear browser cache (Cmd+Shift+Del)
```

---

## Frontend Integration Example

### React Hook for Creating Projects
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const createProject = async (name: string, description: string) => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.details || result.error || "Unknown error");
    }

    // Success - result.data contains the created project
    console.log("Created project:", result.data);
    
    // Refresh projects list
    await fetchProjects();
    
    return result.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create project";
    setError(message);
    console.error("Error creating project:", err);
    throw err;
  } finally {
    setLoading(false);
  }
};
```

---

## Environment Variables

### .env.local (Local Development)
```bash
# Pull from Vercel Dashboard
POSTGRES_URL="postgres://user:password@host:port/dbname?sslmode=require"
```

### Vercel Dashboard
1. Go to: Settings > Environment Variables
2. Add `POSTGRES_URL` from your Vercel Postgres database
3. Save and redeploy

---

## Monitoring & Observability

### Request Tracing with requestId
Every API response includes a unique `requestId`:
```json
{
  "success": true,
  "data": { ... },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Use this to correlate frontend errors with backend logs:
```typescript
// Frontend
const response = await fetch("/api/projects", { ... });
const result = await response.json();
console.error(`Error creating project. Request ID: ${result.requestId}`);

// Backend Logs
// Search for: [550e8400-e29b-41d4-a716-446655440000]
// All logs for this request will include this ID
```

### Vercel Runtime Logs
```
Vercel Dashboard 
  ↓
Your Project 
  ↓
Deployments (latest)
  ↓
Runtime Logs (tab)
  ↓
Search for requestId or error message
```

---

## Performance Tips

1. **Connection Pooling**
   - @vercel/postgres handles this automatically
   - Max connections determined by your Vercel Postgres plan

2. **Cold Starts**
   - First request after deployment may take 1-2 seconds
   - Subsequent requests are <100ms (cached connections)

3. **Database Indexes**
   - Add index on frequently queried columns
   ```sql
   CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
   ```

4. **Pagination** (for GET endpoint)
   - Consider adding LIMIT and OFFSET for large datasets
   - Current implementation limits to 100 rows

---

## Security Notes

✅ **What's Secure:**
- Parameterized queries (SQL injection protected)
- Request validation (malformed data rejected)
- Error messages don't expose sensitive data

⚠️ **What to Improve:**
- Add authentication/authorization middleware
- Implement rate limiting
- Use httpOnly cookies instead of localStorage for tokens
- Add CORS restrictions (currently allows all origins with OPTIONS)

---

## Troubleshooting Workflow

```
API Request Failed
  ↓
1. Check Frontend Console
   - Look for request/response in Network tab
   - Copy requestId from response.json()
   
2. Check Response Status & Message
   - 400: Validation error (check "details" field)
   - 500: Server/database error (check "error" field)
   - 503: Connection timeout (retry request)
   
3. Check Backend Logs
   - Local: Terminal output
   - Vercel: Runtime Logs tab
   - Search for requestId to trace request
   
4. Common Fixes
   - npx vercel env pull .env.local
   - Restart dev server
   - Check POSTGRES_URL is valid
   - Verify database table exists
   - Try request again (might be cold start)
```

---

For more help, check:
- [Vercel Postgres Documentation](https://vercel.com/docs/postgres)
- [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [@vercel/postgres](https://www.npmjs.com/package/@vercel/postgres)
