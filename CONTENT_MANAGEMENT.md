# Content Management System

## Overview

The EchoAid Content Management System provides comprehensive CRUD (Create, Read, Update, Delete) operations for managing sign language content. This system is designed for admin users to efficiently manage the sign language dictionary, including signs, images, videos, and metadata.

## Features

### 🔐 Authentication & Authorization
- **Role-based access control**: Only admin and super admin users can access content management
- **Permission-based operations**: Content management requires `manageContent` permission
- **Secure API endpoints**: All routes are protected with JWT authentication

### 📝 Content Management
- **Create new signs**: Add new sign language entries with comprehensive metadata
- **View all signs**: Browse and search through existing signs with filtering options
- **Update signs**: Modify existing sign information and associated files
- **Delete signs**: Remove signs and their associated files from the system
- **Bulk operations**: Perform operations on multiple signs simultaneously

### 🖼️ File Management
- **Image upload**: Support for sign images with automatic thumbnail generation
- **Video upload**: Support for sign language demonstration videos
- **File optimization**: Automatic image resizing and optimization using Sharp
- **File cleanup**: Automatic deletion of associated files when signs are removed

### 📊 Analytics & Reporting
- **Content statistics**: View comprehensive analytics about signs and categories
- **Export functionality**: Export signs data in JSON or CSV format
- **Usage tracking**: Monitor views, favorites, and practice counts

## API Endpoints

### Content Management Routes

#### GET `/api/admin/content/signs`
Retrieve all signs with pagination and filtering options.

**Query Parameters:**
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `category` (string): Filter by category
- `difficulty` (string): Filter by difficulty level
- `search` (string): Search in word, description, or tags
- `isActive` (boolean): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "sign_id",
      "word": "Hello",
      "category": "phrases",
      "difficulty": "Beginner",
      "description": "Greeting sign",
      "imagePath": "/path/to/image.jpg",
      "thumbnailPath": "/path/to/thumbnail.jpg",
      "videoPath": "/path/to/video.mp4",
      "tags": ["greeting", "basic"],
      "usage": "Common greeting",
      "signLanguageType": "ASL",
      "handDominance": "right",
      "isActive": true,
      "createdBy": {
        "_id": "user_id",
        "name": "Admin User",
        "email": "admin@echoaid.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

#### GET `/api/admin/content/signs/:id`
Retrieve a specific sign by ID.

#### POST `/api/admin/content/signs`
Create a new sign.

**Request Body (multipart/form-data):**
```json
{
  "word": "Hello",
  "category": "phrases",
  "difficulty": "Beginner",
  "description": "Greeting sign",
  "tags": "greeting, basic, hello",
  "usage": "Common greeting",
  "signLanguageType": "ASL",
  "handDominance": "right",
  "facialExpression": "Smile",
  "bodyPosition": "Standing",
  "movement": "Wave hand",
  "isActive": true,
  "image": "file",
  "video": "file"
}
```

#### PUT `/api/admin/content/signs/:id`
Update an existing sign.

#### DELETE `/api/admin/content/signs/:id`
Delete a sign and its associated files.

#### POST `/api/admin/content/signs/bulk`
Perform bulk operations on multiple signs.

**Request Body:**
```json
{
  "operation": "activate|deactivate|delete|update",
  "signIds": ["id1", "id2", "id3"],
  "data": {} // Required for update operation
}
```

#### GET `/api/admin/content/stats`
Get content statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSigns": 150,
    "activeSigns": 140,
    "inactiveSigns": 10,
    "signsByCategory": [
      { "_id": "alphabet", "count": 26 },
      { "_id": "phrases", "count": 50 }
    ],
    "signsByDifficulty": [
      { "_id": "Beginner", "count": 80 },
      { "_id": "Intermediate", "count": 50 }
    ],
    "signsByLanguage": [
      { "_id": "ASL", "count": 100 },
      { "_id": "BSL", "count": 50 }
    ],
    "recentSigns": 15
  }
}
```

#### GET `/api/admin/content/signs/export`
Export signs data.

**Query Parameters:**
- `format` (string): Export format - "json" or "csv" (default: "json")
- `category` (string): Filter by category
- `isActive` (boolean): Filter by active status

## Frontend Components

### ContentManagement Component

The main content management component provides a user-friendly interface for managing signs.

**Features:**
- **Responsive table**: Display signs with sorting and filtering
- **Search functionality**: Search through signs by word, description, or tags
- **Category filtering**: Filter signs by category
- **Status indicators**: Visual indicators for active/inactive signs
- **Action buttons**: Edit and delete actions for each sign
- **Modal forms**: Create and edit forms in modal dialogs
- **File upload**: Drag-and-drop file upload for images and videos
- **Export functionality**: Download signs data in CSV format

**Usage:**
```jsx
import ContentManagement from '../components/ContentManagement';

function AdminDashboard() {
  return (
    <div>
      <ContentManagement />
    </div>
  );
}
```

## Database Schema

### Sign Model

```javascript
{
  word: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    enum: ['alphabet', 'phrases', 'family', 'activities', 'advanced', 'numbers']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  imagePath: {
    type: String,
    required: true
  },
  thumbnailPath: {
    type: String,
    required: true
  },
  videoPath: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  usage: {
    type: String,
    maxlength: 200
  },
  stats: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    practiceCount: { type: Number, default: 0 }
  },
  relatedSigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  audioPath: {
    type: String,
    default: null
  },
  signLanguageType: {
    type: String,
    enum: ['ASL', 'BSL', 'AUSLAN', 'ISL'],
    default: 'ASL'
  },
  handDominance: {
    type: String,
    enum: ['right', 'left', 'both'],
    default: 'right'
  },
  facialExpression: {
    type: String,
    maxlength: 100
  },
  bodyPosition: {
    type: String,
    maxlength: 100
  },
  movement: {
    type: String,
    maxlength: 200
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}
```

## File Structure

```
backend/
├── controllers/
│   └── contentController.js          # Content management logic
├── routes/
│   └── content.js                    # Content management routes
├── middleware/
│   └── roleAuth.js                   # Authorization middleware
├── microservices/
│   └── dictionary/
│       └── models/
│           └── Sign.js               # Sign data model
└── assets/
    ├── signs/                        # Original sign images
    ├── optimized/                    # Optimized thumbnails
    └── videos/                       # Sign videos

frontend/
├── src/
│   ├── components/
│   │   └── ContentManagement.jsx     # Content management UI
│   └── pages/
│       └── AdminDashboard.jsx        # Admin dashboard with content tab
```

## Security Features

### Authentication
- JWT-based authentication for all API endpoints
- Token validation on every request
- Automatic token refresh mechanism

### Authorization
- Role-based access control (admin, super_admin)
- Permission-based operations
- Content ownership tracking

### File Security
- File type validation (images: jpg, png, gif; videos: mp4)
- File size limits (50MB max)
- Secure file storage with proper directory structure
- Automatic file cleanup on deletion

## Error Handling

The system includes comprehensive error handling:

- **Validation errors**: Detailed validation messages for form fields
- **File upload errors**: Clear error messages for file-related issues
- **Permission errors**: Proper HTTP status codes for unauthorized access
- **Database errors**: Graceful handling of database operation failures

## Performance Optimizations

- **Image optimization**: Automatic thumbnail generation using Sharp
- **Pagination**: Efficient data loading with pagination support
- **Indexing**: Database indexes for better query performance
- **Caching**: Image caching with proper headers
- **File compression**: Optimized image and video delivery

## Testing

Run the test script to verify API functionality:

```bash
cd backend
node test-content-api.js
```

This will test:
- Authentication
- Content statistics
- CRUD operations
- Bulk operations
- File uploads
- Error handling

## Usage Examples

### Creating a New Sign

1. Navigate to the Admin Dashboard
2. Click on the "Content Management" tab
3. Click "Add New Sign"
4. Fill in the required information:
   - Word: "Hello"
   - Category: "phrases"
   - Difficulty: "Beginner"
   - Description: "Greeting sign"
   - Upload an image and/or video
5. Click "Create Sign"

### Editing a Sign

1. Find the sign in the content table
2. Click the edit (pencil) icon
3. Modify the desired fields
4. Click "Update Sign"

### Deleting a Sign

1. Find the sign in the content table
2. Click the delete (trash) icon
3. Confirm the deletion in the modal
4. The sign and associated files will be removed

### Exporting Data

1. Click the "Export" button in the content management interface
2. Choose the desired format (CSV or JSON)
3. The file will be downloaded automatically

## Future Enhancements

- **Advanced search**: Full-text search with Elasticsearch
- **Content versioning**: Track changes and rollback capabilities
- **Bulk import**: CSV/Excel import functionality
- **Content approval workflow**: Multi-step approval process
- **Advanced analytics**: Detailed usage analytics and reporting
- **Content recommendations**: AI-powered content suggestions
- **Multi-language support**: Internationalization for different sign languages
- **Mobile app integration**: API endpoints for mobile applications

## Troubleshooting

### Common Issues

1. **File upload fails**: Check file size and type restrictions
2. **Permission denied**: Ensure user has admin role and content management permissions
3. **Database connection**: Verify MongoDB connection and credentials
4. **Image optimization**: Ensure Sharp library is properly installed

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=content-management
```

This will provide detailed logs for content management operations.

## Support

For technical support or questions about the content management system, please refer to the main project documentation or contact the development team. 