# Admin Dashboard Documentation

## Overview

A comprehensive admin dashboard for managing your website's projects, users, and statistics. Only authenticated admins can access the dashboard.

## Features

### 1. **Authentication** 🔐
- Admin login with unique credentials
- Session-based authentication using localStorage
- Secure logout functionality

### 2. **Dashboard Overview** 📊
- View total number of projects
- View total number of users/contacts
- See recent submissions in the last 30 days
- Quick navigation to all admin features

### 3. **Project Management** 📁
- **Add New Projects**: Create projects with title, slug, category, description, tech stack, image, and link
- **Edit Projects**: Update existing project information
- **Delete Projects**: Remove projects from the system
- **View All Projects**: See complete list of all projects with all details
- All projects are stored and persist during the session

### 4. **User Management** 👥
- **Add Users**: Manually add website visitors/contacts
- **View Users**: See all users with their contact information and messages
- **Edit Users**: Update user information and notes
- **Delete Users**: Remove users from the system
- Track submission dates for each user

### 5. **Settings** ⚙️
- **Change Password**: Update admin account password
- View admin account information

## Accessing the Admin Panel

### URL
```
/admin/login
```

### Default Credentials
```
Username: admin
Password: admin123
```

⚠️ **Security Note**: Change the default password immediately in production!

## File Structure

```
app/
├── (admin)/
│   ├── layout.tsx              # Admin layout with auth protection
│   ├── page.tsx                # Dashboard overview
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── projects/
│   │   └── page.tsx            # Projects management
│   ├── users/
│   │   └── page.tsx            # Users management
│   └── settings/
│       └── page.tsx            # Admin settings
├── api/
│   └── admin/
│       ├── login/
│       │   └── route.ts        # Login endpoint
│       ├── stats/
│       │   └── route.ts        # Statistics endpoint
│       ├── projects/
│       │   ├── route.ts        # Projects CRUD (GET, POST)
│       │   └── [id]/
│       │       └── route.ts    # Single project operations (GET, PUT, DELETE)
│       ├── users/
│       │   ├── route.ts        # Users CRUD (GET, POST)
│       │   └── [id]/
│       │       └── route.ts    # Single user operations (GET, PUT, DELETE)
│       └── change-password/
│           └── route.ts        # Change password endpoint
├── lib/
│   ├── constants.ts            # Data types and initial data
│   └── datastore.ts            # In-memory data management
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
  - Body: `{ username: string, password: string }`
  - Returns: Admin info on success

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics
  - Returns: `{ totalProjects, totalUsers, recentSubmissions }`

### Projects
- `GET /api/admin/projects` - Get all projects
- `POST /api/admin/projects` - Create new project
- `GET /api/admin/projects/[id]` - Get specific project
- `PUT /api/admin/projects/[id]` - Update project
- `DELETE /api/admin/projects/[id]` - Delete project

### Users
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users/[id]` - Get specific user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Settings
- `POST /api/admin/change-password` - Change admin password
  - Body: `{ currentPassword: string, newPassword: string, adminUsername: string }`

## How to Use

### 1. Login
1. Navigate to `/admin/login`
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Login"

### 2. View Dashboard
- See statistics of projects and users
- Access quick action buttons for different features

### 3. Manage Projects
1. Click "Manage Projects"
2. Click "Add New Project" to create a new project
3. Fill in project details:
   - Title: Project name
   - Slug: URL-friendly identifier
   - Category: Project category
   - Summary: Brief description
   - Description: Detailed description
   - Stack: Technologies used (comma-separated)
   - Image URL: Project image path
   - Link: Project website link
4. Click "Save Project"
5. To edit: Click "Edit" on any project
6. To delete: Click "Delete" and confirm

### 4. Manage Users
1. Click "Manage Users"
2. Click "Add New User" to manually add a contact
3. Fill in user details:
   - Name: User full name
   - Email: User email address
   - Message: Optional message or notes
4. Click "Save User"
5. To edit: Click "Edit" on any user
6. To delete: Click "Delete" and confirm

### 5. Change Password
1. Click "Settings"
2. Fill in password change form:
   - Current Password: Your existing password
   - New Password: Your new password
   - Confirm Password: Repeat new password
3. Click "Update Password"

## Data Persistence

### Current Implementation
- Uses **in-memory storage** (datastore.ts)
- Data persists during the current session
- Data resets when the server restarts

### Production Implementation
For a production environment, implement a proper database:

1. **MongoDB Example**
   ```typescript
   // Install: npm install mongodb
   // Add connection string to environment variables
   // Implement database models for Projects and Users
   ```

2. **PostgreSQL Example**
   ```typescript
   // Install: npm install @prisma/client prisma
   // Run: npx prisma init
   // Define schema and migrate
   ```

3. **Firebase/Firestore Example**
   ```typescript
   // Install: npm install firebase
   // Configure Firebase in your project
   // Use Firestore for data storage
   ```

## Security Considerations

### Current Implementation
⚠️ The current setup is for **development only**. For production:

1. **Password Security**
   - Use bcrypt or argon2 for password hashing
   - Never store plain text passwords

2. **Authentication**
   - Implement JWT or session-based authentication
   - Add CSRF protection
   - Use secure HTTP-only cookies

3. **Database**
   - Use a proper database instead of in-memory storage
   - Add database encryption

4. **Authorization**
   - Implement role-based access control (RBAC)
   - Add audit logs for all admin actions
   - Set up two-factor authentication (2FA)

5. **Environment Variables**
   ```env
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD_HASH=hashed_password
   DATABASE_URL=your_database_url
   NEXTAUTH_SECRET=your_secret_key
   ```

## Troubleshooting

### Login not working
- Check if credentials are correct
- Ensure localStorage is enabled in browser
- Try clearing browser cache

### Data not persisting
- Current implementation uses in-memory storage
- Data will reset when the server restarts
- Implement a database for persistent storage

### CSS/Styling issues
- Ensure Tailwind CSS and UI components are installed
- Run `npm install` to install dependencies
- Clear Next.js cache: `rm -rf .next`

### API errors
- Check browser console for error messages
- Verify all required fields are filled in forms
- Check if the admin is properly authenticated

## Example Usage

### Create a New Project
```bash
curl -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Project",
    "slug": "my-new-project",
    "category": "Web Design",
    "summary": "A great new project",
    "description": "Full description here",
    "stack": ["Next.js", "React", "Tailwind CSS"],
    "image": "/projects/new.jpg",
    "link": "https://example.com"
  }'
```

### Create a New User
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Great work!"
  }'
```

## Next Steps

1. **Set up a database** - Replace in-memory storage with MongoDB, PostgreSQL, or Firebase
2. **Implement authentication** - Use NextAuth.js or similar for secure session management
3. **Add file uploads** - Allow uploading project images and documents
4. **Implement validation** - Add more thorough input validation and error handling
5. **Add notifications** - Email notifications for new users or contacts
6. **Create backups** - Set up automatic data backups
7. **Add analytics** - Track admin panel usage and user interactions

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
