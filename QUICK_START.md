# Admin Dashboard Quick Start Guide

## 🚀 Getting Started

Your admin dashboard is now ready! Follow these simple steps to access and use it.

### Step 1: Access the Admin Panel
Open your browser and navigate to:
```
http://localhost:3001/admin/login
```
(or http://localhost:3000/admin/login if port 3001 is not available)

### Step 2: Login with Default Credentials
```
Username: admin
Password: admin123
```

⚠️ **Important**: Change the default password immediately after first login!

### Step 3: Explore the Dashboard
Once logged in, you'll see:
- **Dashboard Overview** - View statistics for projects, users, and recent submissions
- **Manage Projects** - Add, edit, and delete portfolio projects
- **Manage Users** - Add, edit, and delete website contacts
- **Settings** - Change your admin password

## 📋 Features Overview

### Dashboard
- 📊 View total number of projects
- 👥 View total number of users/contacts  
- 📧 See recent submissions in the past 30 days
- 🔗 Quick access buttons to all features

### Projects Management
- ✅ **Add Projects**: Click "Add New Project" to create a new portfolio item
- ✏️ **Edit Projects**: Click "Edit" on any project to modify its details
- 🗑️ **Delete Projects**: Remove projects with confirmation
- 📝 **Project Details**: Include title, slug, category, description, tech stack, image URL, and project link

### Users Management  
- ✅ **Add Users**: Manually add website visitors/contacts
- ✏️ **Edit Users**: Update user information and notes
- 🗑️ **Delete Users**: Remove users from the system
- 📅 **Track Dates**: See when users submitted their information

### Settings
- 🔒 Change your admin password
- ℹ️ View your admin account information

## 🎯 Common Tasks

### Adding a New Project
1. Click "Manage Projects"
2. Click "Add New Project"
3. Fill in the project details:
   - **Title**: Name of your project
   - **Slug**: URL-friendly identifier (e.g., "my-awesome-project")
   - **Category**: Project type (e.g., "Brand experience", "Product launch")
   - **Summary**: Brief 1-2 sentence description
   - **Description**: Detailed description of the project
   - **Stack**: Technologies used (comma-separated, e.g., "Next.js, React, Tailwind CSS")
   - **Image URL**: Path to project image (e.g., "/projects/image.jpg")
   - **Link**: Project website URL (optional)
4. Click "Save Project"

### Adding a New User/Contact
1. Click "Manage Users"
2. Click "Add New User"
3. Fill in the user details:
   - **Name**: User's full name
   - **Email**: User's email address
   - **Message**: Optional message or notes from the user
4. Click "Save User"

### Changing Your Password
1. Click "Settings"
2. Fill in the password change form:
   - **Current Password**: Your existing password
   - **New Password**: Your new password (minimum 6 characters)
   - **Confirm Password**: Re-enter your new password
3. Click "Update Password"

## 📁 Project Structure

```
admin/
├── layout.tsx              # Admin layout wrapper
├── page.tsx                # Dashboard page
├── login/
│   └── page.tsx            # Login page
├── projects/
│   └── page.tsx            # Projects management
├── users/
│   └── page.tsx            # Users management
└── settings/
    └── page.tsx            # Settings page

api/
└── admin/
    ├── login/route.ts      # Login API
    ├── stats/route.ts      # Statistics API
    ├── projects/           # Projects CRUD API
    ├── users/              # Users CRUD API
    └── change-password/    # Password change API

lib/
├── constants.ts            # Data types and initial data
├── datastore.ts            # In-memory data store
└── admin-components.tsx    # Reusable admin components
```

## 🔐 Security Notes

### Current Setup (Development)
- Uses **localStorage** for session management
- In-memory data storage (resets on server restart)
- Plain text passwords (demo only)

### Production Requirements
You'll need to implement:

1. **Database Setup**
   ```bash
   # Option 1: MongoDB
   npm install mongodb
   
   # Option 2: PostgreSQL with Prisma
   npm install @prisma/client prisma
   npx prisma init
   
   # Option 3: Firebase
   npm install firebase
   ```

2. **Password Hashing**
   ```bash
   npm install bcryptjs
   ```

3. **Authentication**
   ```bash
   # Use NextAuth.js for secure authentication
   npm install next-auth
   ```

4. **Environment Variables** (.env.local)
   ```env
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD_HASH=hashed_password
   DATABASE_URL=your_database_url
   NEXTAUTH_SECRET=your_secret_key
   ```

## 🐛 Troubleshooting

### Issue: Cannot login
**Solution**: 
- Check that username is "admin" and password is "admin123"
- Ensure browser allows localStorage
- Clear browser cache and try again

### Issue: Data not saving
**Solution**:
- Current setup uses in-memory storage
- Data resets when server restarts
- Implement a proper database for persistent storage

### Issue: Page shows blank after login
**Solution**:
- Refresh the page
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`
- Log in again

### Issue: CSS styling not showing correctly
**Solution**:
- Ensure Tailwind CSS is installed: `npm install`
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

## 📚 Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# View logs in development
npm run dev -- --debug
```

## 🔄 API Endpoints Reference

All endpoints require proper authentication (implement in production)

### Authentication
- `POST /api/admin/login` - Login with username and password

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

### Projects
- `GET /api/admin/projects` - Get all projects
- `POST /api/admin/projects` - Create new project
- `PUT /api/admin/projects/[id]` - Update project
- `DELETE /api/admin/projects/[id]` - Delete project

### Users
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Settings
- `POST /api/admin/change-password` - Change admin password

## 📞 Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Sonner Toast Notifications](https://sonner.emilkowal.ski)

## ✅ Next Steps

1. **Change your password** - Don't keep the default credentials
2. **Add your projects** - Start populating your portfolio
3. **Test user management** - Add some test users
4. **Customize styling** - Modify colors and design to match your brand
5. **Implement database** - Set up a real database for production
6. **Add more features** - Consider adding image uploads, analytics, etc.

Enjoy your new admin dashboard! 🎉
