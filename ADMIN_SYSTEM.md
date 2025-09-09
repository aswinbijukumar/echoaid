# EchoAid Admin System

## Overview

The EchoAid platform features three distinct user roles to ensure smooth operation and an enriching learning experience:

### User Roles

#### 1. Super Admin
- **Authority**: Ultimate authority over the entire platform
- **Responsibilities**:
  - Manage all users (create, edit, delete, assign roles)
  - Manage all content (ISL lessons, dictionary, quizzes)
  - System settings and configuration
  - View comprehensive analytics
  - Platform oversight and decision-making
- **Access**: Full system access with all permissions

#### 2. Admin
- **Authority**: Operational management under super admin guidance
- **Responsibilities**:
  - Add and manage educational materials
  - Moderate user interactions and forum posts
  - Maintain assigned content sections
  - View analytics for their assigned areas
  - Content creation and curation
- **Access**: Limited to content management and moderation

#### 3. User
- **Authority**: Core audience engaging with learning resources
- **Responsibilities**:
  - Engage with learning resources
  - Track progress and earn badges
  - Provide feedback and participate in community
  - Drive the platform's educational mission
- **Access**: Learning features and community participation

## Features

### Super Admin Dashboard (`/super-admin`)
- **User Management**: Complete user CRUD operations
- **System Analytics**: Comprehensive platform statistics
- **System Settings**: Email verification, registration, maintenance mode
- **Content Oversight**: Manage all learning materials
- **Real-time Monitoring**: System health and alerts

### Admin Dashboard (`/admin`)
- **Content Management**: Learning modules, dictionary, quizzes, forum
- **Media Library**: Images, videos, and educational resources
- **Moderation Tools**: Forum post review and approval
- **Analytics**: Content performance and user engagement
- **Quick Actions**: Rapid content creation and management

### Role-Based Routing
- Automatic redirection based on user role
- Super Admins → `/super-admin`
- Admins → `/admin`
- Users → `/dashboard`

## Setup Instructions

### 1. Database Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create admin users
npm run create-admin
```

### 2. Admin Credentials
After running the setup script, you'll have:

**Super Admin:**
- Email: `superadmin@echoaid.com`
- Password: `SuperAdmin123!`

**Admin:**
- Email: `admin@echoaid.com`
- Password: `Admin123!`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## API Endpoints

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Get admin dashboard data
- `GET /stats` - Get user statistics
- `GET /users` - Get all users (Super Admin only)
- `GET /users/:id` - Get specific user (Super Admin only)
- `PUT /users/:id` - Update user (Super Admin only)
- `DELETE /users/:id` - Delete user (Super Admin only)

### Authentication
All admin routes require authentication and appropriate role permissions.

## Permissions System

### Super Admin Permissions
- `manageUsers`: Full user management
- `manageContent`: All content management
- `manageSystem`: System configuration
- `viewAnalytics`: Complete analytics access
- `moderateForum`: Forum moderation

### Admin Permissions
- `manageUsers`: ❌ No access
- `manageContent`: ✅ Content management
- `manageSystem`: ❌ No access
- `viewAnalytics`: ✅ Limited analytics
- `moderateForum`: ✅ Forum moderation

### User Permissions
- All permissions set to `false`
- Access to learning features only

## Security Features

### Role-Based Access Control
- Middleware protection on all admin routes
- Automatic permission checking
- Role-based UI navigation

### Authentication
- JWT token-based authentication
- Token expiration (2 hours)
- Secure password hashing

### Data Protection
- Password field excluded from queries
- Input validation and sanitization
- Rate limiting on sensitive endpoints

## Usage Guide

### For Super Admins
1. **User Management**: Use the user table to manage all platform users
2. **System Monitoring**: Check system health and recent activity
3. **Content Oversight**: Review and approve content changes
4. **Analytics**: Monitor platform performance and user engagement

### For Admins
1. **Content Creation**: Add new lessons, quizzes, and dictionary entries
2. **Moderation**: Review forum posts and user-generated content
3. **Analytics**: Track content performance and user engagement
4. **Media Management**: Organize and maintain educational resources

### Navigation
- **Sidebar**: Role-specific navigation menu
- **Dashboard**: Role-appropriate landing page
- **Quick Actions**: Common tasks for each role

## Development Notes

### Adding New Permissions
1. Update User model in `backend/models/User.js`
2. Add permission check in `backend/middleware/roleAuth.js`
3. Update role-based permission assignment
4. Test with different user roles

### Adding New Admin Features
1. Create controller in `backend/controllers/adminController.js`
2. Add route in `backend/routes/admin.js`
3. Create frontend component
4. Add to appropriate dashboard
5. Update navigation if needed

### Testing
- Test with different user roles
- Verify permission restrictions
- Check role-based routing
- Test admin user creation

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check user role and permissions
2. **Route Not Found**: Verify admin routes are mounted
3. **Authentication Failed**: Check JWT token validity
4. **Database Connection**: Ensure MongoDB is running

### Debug Commands
```bash
# Check database health
npm run db:health

# Create admin users
npm run create-admin

# View server logs
npm run dev
```

## Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Bulk user operations
- Content approval workflow
- Automated moderation tools
- Advanced reporting system
- Multi-language support for admin interface

### Scalability Considerations
- Redis caching for analytics
- Database indexing for large user bases
- CDN integration for media files
- Microservices architecture for admin features 