# Admin Dashboard - Visual Guide & Cheat Sheet

## 🎯 Quick Access Links

### Login Page
```
http://localhost:3001/admin/login
```

### Admin Routes
```
/admin                    → Dashboard
/admin/projects          → Project Management
/admin/users            → User Management
/admin/settings         → Admin Settings
```

---

## 📊 Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Admin Dashboard          [Logout Button]    │
│  Welcome, admin                              │
└─────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  📁 Projects │  │  👥 Users    │  │  📧 Recent   │
│      2       │  │      1       │  │  Submissions │
│             │  │             │  │      0       │
└──────────────┘  └──────────────┘  └──────────────┘

┌─────────────────────────────────────────────┐
│  Quick Actions                              │
│  [Manage Projects] [Manage Users] [Settings]│
└─────────────────────────────────────────────┘
```

---

## 📝 Projects Management

### View All Projects
```
GET /api/admin/projects
Response: Array of Project objects
```

### Add New Project
```
Form Fields:
- Title: "Project Name"
- Slug: "project-slug"
- Category: "Brand experience"
- Summary: "Brief description"
- Description: "Full description"
- Stack: "Next.js, React, Tailwind"
- Image URL: "/projects/image.jpg"
- Link: "https://project.com"

POST /api/admin/projects
```

### Edit Project
```
PUT /api/admin/projects/[id]
Body: { Updated project data }
```

### Delete Project
```
DELETE /api/admin/projects/[id]
Requires: Confirmation
```

---

## 👥 Users Management

### View All Users
```
GET /api/admin/users
Response: Array of User objects with:
- id, name, email, message, submittedAt
```

### Add New User
```
Form Fields:
- Name: "User Name"
- Email: "user@example.com"
- Message: "Optional message"

POST /api/admin/users
```

### Edit User
```
PUT /api/admin/users/[id]
Body: { Updated user data }
```

### Delete User
```
DELETE /api/admin/users/[id]
Requires: Confirmation
```

---

## 🔐 Authentication

### Login
```
POST /api/admin/login
Body: {
  "username": "admin",
  "password": "admin123"
}
Response: { message, admin: { id, username } }
```

### Session Storage
```javascript
localStorage.setItem("isAdmin", "true")
localStorage.setItem("adminUsername", "admin")
```

### Check Authentication
```javascript
const isAdmin = localStorage.getItem("isAdmin")
// Returns: "true" or null
```

### Logout
```javascript
localStorage.removeItem("isAdmin")
localStorage.removeItem("adminUsername")
```

---

## 📊 Statistics API

### Get Dashboard Stats
```
GET /api/admin/stats
Response: {
  "totalProjects": number,
  "totalUsers": number,
  "recentSubmissions": number
}
```

---

## ⚙️ Admin Settings

### Change Password
```
POST /api/admin/change-password
Body: {
  "currentPassword": "admin123",
  "newPassword": "newpassword",
  "adminUsername": "admin"
}
```

---

## 🗂️ File Organization

```
Admin System Structure:

app/
├── admin/
│   ├── layout.tsx          ← Auth wrapper (protects routes)
│   ├── page.tsx            ← Dashboard (/)
│   ├── login/
│   │   └── page.tsx        ← Login page
│   ├── projects/
│   │   └── page.tsx        ← Projects CRUD
│   ├── users/
│   │   └── page.tsx        ← Users CRUD
│   └── settings/
│       └── page.tsx        ← Settings page
│
├── api/admin/
│   ├── login/route.ts
│   ├── stats/route.ts
│   ├── projects/
│   │   ├── route.ts        ← List & Create
│   │   └── [id]/route.ts   ← Get, Update, Delete
│   ├── users/
│   │   ├── route.ts        ← List & Create
│   │   └── [id]/route.ts   ← Get, Update, Delete
│   └── change-password/route.ts
│
└── lib/
    ├── constants.ts         ← Data types & initial data
    ├── datastore.ts         ← In-memory data management
    └── admin-components.tsx ← Reusable components
```

---

## 🔄 Data Flow Diagram

### User Login
```
User Input (username/password)
        ↓
POST /api/admin/login
        ↓
Validate against ADMIN_CREDENTIALS
        ↓
Set localStorage ("isAdmin", "adminUsername")
        ↓
Redirect to /admin
```

### Add Project
```
User fills form
        ↓
POST /api/admin/projects
        ↓
dataStore.createProject(data)
        ↓
Generate ID, timestamps
        ↓
Add to in-memory store
        ↓
Fetch updated list
        ↓
Display success notification
```

### Edit Project
```
User clicks Edit
        ↓
Load current project data into form
        ↓
User modifies fields
        ↓
PUT /api/admin/projects/[id]
        ↓
dataStore.updateProject(id, newData)
        ↓
Update in-memory store
        ↓
Refresh project list
        ↓
Display success notification
```

### Delete Project
```
User clicks Delete
        ↓
Show confirmation dialog
        ↓
User confirms
        ↓
DELETE /api/admin/projects/[id]
        ↓
dataStore.deleteProject(id)
        ↓
Remove from in-memory store
        ↓
Refresh project list
        ↓
Display success notification
```

---

## 💾 Data Models

### Project
```typescript
{
  id: string              // "proj-001"
  slug: string            // "aurora-studio"
  title: string           // "Aurora Studio"
  category: string        // "Brand experience"
  summary: string         // "A premium portfolio..."
  description: string     // "Aurora Studio needed..."
  stack: string[]         // ["Next.js", "React", ...]
  image?: string          // "/projects/image.jpg"
  link?: string           // "https://example.com"
  createdAt?: Date        // Timestamp
  updatedAt?: Date        // Timestamp
}
```

### User
```typescript
{
  id: string              // "user-001"
  name: string            // "John Doe"
  email: string           // "john@example.com"
  message?: string        // "Great work!"
  submittedAt?: Date      // Timestamp
}
```

### Admin
```typescript
{
  id: string              // "admin-001"
  username: string        // "admin"
  password: string        // "admin123" (change me!)
  email: string           // "admin@example.com"
  createdAt: Date         // Timestamp
}
```

---

## 🎨 UI Components

### Button Styles
```
Blue Buttons: .bg-blue-600 hover:bg-blue-700
Green Buttons: .bg-green-600 hover:bg-green-700
Red Buttons: .bg-red-600 hover:bg-red-700
Yellow Buttons: .bg-yellow-600 hover:bg-yellow-700
Purple Buttons: .bg-purple-600 hover:bg-purple-700
```

### Colors
```
Background: slate-900, slate-800, slate-700
Text: white, slate-300, slate-400, slate-500
Primary: blue-600
Success: green-600
Danger: red-600
Warning: yellow-600
Info: purple-600
```

---

## 🚀 Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# View TypeScript errors
npm run type-check

# Clean cache
rm -rf .next
```

---

## 📱 Responsive Breakpoints

```
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px

Grid Layout:
- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop
```

---

## 🔒 Security Reminders

- ⚠️ Change default password IMMEDIATELY
- ⚠️ Current setup is development only
- ⚠️ Use HTTPS in production
- ⚠️ Hash passwords with bcryptjs
- ⚠️ Implement proper authentication (NextAuth.js)
- ⚠️ Use environment variables for secrets
- ⚠️ Set up database for data persistence
- ⚠️ Add rate limiting to API routes
- ⚠️ Enable CSRF protection
- ⚠️ Add audit logging

---

## ✅ Testing Checklist

- [ ] Can login with admin/admin123
- [ ] Dashboard shows correct stats
- [ ] Can add a project
- [ ] Can edit a project
- [ ] Can delete a project
- [ ] Can add a user
- [ ] Can edit a user
- [ ] Can delete a user
- [ ] Can change password
- [ ] Can logout
- [ ] Redirects to login when accessing without auth
- [ ] Toast notifications appear for actions
- [ ] Forms validate inputs
- [ ] Delete confirmations work

---

## 📞 Support Files

| File | Contains |
|------|----------|
| `README_ADMIN.md` | Overview & quick links |
| `QUICK_START.md` | User guide & common tasks |
| `ADMIN_SETUP_COMPLETE.md` | Implementation summary |
| `ADMIN_README.md` | Complete documentation |
| `ADMIN_FILE_INDEX.md` | Technical reference |

---

## 🎯 Common Errors & Solutions

```
Error: "Cannot find module"
Solution: npm install

Error: "Port 3000 in use"
Solution: Dev server uses next available port automatically

Error: "Data not saving"
Solution: Uses in-memory storage, data resets on server restart

Error: "CSS not loading"
Solution: rm -rf .next && npm run dev

Error: "Cannot login"
Solution: username=admin, password=admin123, check localStorage
```

---

## 🚀 Ready to Deploy?

See `ADMIN_README.md` → Production section for:
- Database setup
- Security implementation
- Environment configuration
- Deployment instructions
- Monitoring setup

---

**Your Admin Dashboard is Ready! 🎉**

Start with: `npm run dev`
Then visit: `http://localhost:3001/admin/login`
