# School ERP Frontend with AI Integration - Lovable Development Prompt

Build a modern, responsive React TypeScript frontend for a School ERP system with comprehensive AI capabilities.

## 🏗️ **Project Requirements**

### **Technology Stack**
- React 18+ with TypeScript
- Tailwind CSS for styling
- React Query/TanStack Query for API state management
- React Router v6 for navigation
- Zustand for local state management
- Recharts for data visualization
- React Hook Form with Zod validation
- Lucide React for icons
- Shadcn/ui component library

### **Authentication & Security**
- JWT token-based authentication
- Role-based access control (ADMIN, TEACHER, STUDENT, PARENT)
- Protected routes with role guards
- Auto-refresh tokens
- Secure logout functionality

## 🎨 **Design Requirements**

### **UI/UX Guidelines**
- Clean, modern design with educational theme
- Responsive design (mobile-first approach)
- Consistent color scheme: Primary blue (#2563eb), Secondary green (#059669)
- Accessible design (WCAG 2.1 AA compliance)
- Loading states and error handling
- Toast notifications for user feedback

### **Layout Structure**
- Sidebar navigation with collapsible menu
- Top header with user profile, notifications, and search
- Breadcrumb navigation
- Footer with school information

## 📱 **Core Features & Pages**

### **1. Authentication Pages**
```typescript
// Login page with role selection
- Email/password login form
- "Forgot Password" functionality  
- Role-based dashboard redirection
- Remember me option
```

### **2. Dashboard Pages (Role-specific)**
```typescript
// Admin Dashboard
- School overview metrics
- Student/teacher statistics
- Financial summary
- Recent activities feed
- Quick action buttons

// Teacher Dashboard  
- Class overview
- Today's schedule
- Pending assignments
- Student performance summary
- AI teaching assistant

// Student Dashboard
- Personal timetable
- Upcoming assignments
- Grade summary
- Attendance overview
- AI study companion

// Parent Dashboard
- Children's overview
- Academic progress
- Attendance reports
- School communications
- Payment status
```

### **3. User Management Module**
```typescript
// User listing with filters and search
- DataTable with pagination
- Role-based filtering
- Bulk actions (activate/deactivate)
- Export functionality
- Create/Edit user modals
```

### **4. Academic Management**
```typescript
// Class & Section Management
- Class hierarchy view
- Student enrollment interface
- Teacher assignment
- Timetable management

// Subject Management
- Subject listing and CRUD
- Teacher-subject mapping
- Credit system management
```

### **5. Attendance System**
```typescript
// Attendance marking interface
- Calendar-based date selection
- Class-wise student listing
- Quick mark all present/absent
- Attendance reports with charts
- AI-powered attendance insights
```

### **6. Examination & Grading**
```typescript
// Exam management
- Exam scheduling interface
- Grade entry forms
- Report card generation
- Performance analytics
- Parent-teacher communication
```

### **7. AI Integration Hub**
```typescript
// AI Dashboard
- AI service status indicators
- Recent AI interactions
- Quick AI tools access
- Usage analytics

// AI Analytics Center
- Performance prediction charts
- Attendance pattern analysis
- Risk assessment displays
- Intervention recommendations

// AI Content Generator
- Lesson plan creator
- Quiz generator interface
- Assignment creator
- Educational content library

// AI Assistant Chat
- Contextual AI chatbot
- Role-specific capabilities
- Conversation history
- Quick action buttons
```

## 🤖 **AI Feature Specifications**

### **AI Analytics Visualizations**
```typescript
// Charts and graphs for:
- Student performance trends (line charts)
- Attendance patterns (heatmaps)
- Grade distributions (bar charts)  
- Risk assessment dashboards
- Predictive analytics displays
```

### **AI Assistant Interface**
```typescript
// Chat-like interface with:
- Message bubbles with timestamps
- Typing indicators
- File upload capabilities
- Voice input support
- Quick suggestion chips
- Export conversation feature
```

### **AI Content Tools**
```typescript
// Content generation interfaces:
- Form-based quiz creator
- Drag-and-drop lesson planner
- Template-based assignment builder
- Multi-media content organizer
```

## 🔌 **API Integration**

### **Base Configuration**
```typescript
// API endpoints to integrate:
const API_BASE = 'http://localhost:3000/api';

// Authentication endpoints
POST /api/auth/login
GET /api/auth/profile
POST /api/auth/logout

// User management
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id

// Academic endpoints
GET /api/classes
GET /api/students
GET /api/teachers
GET /api/attendance
GET /api/exams

// AI endpoints
POST /api/ai/process
GET /api/ai/services
POST /api/ai/analytics
POST /api/ai/predictions
POST /api/ai/automation
POST /api/ai/content
POST /api/ai/emergency
POST /api/ai/behavior
POST /api/ai/resources
```

### **Error Handling**
```typescript
// Implement comprehensive error handling:
- Network errors with retry logic
- Validation errors with field highlighting
- Permission errors with clear messaging
- Loading states for all async operations
```

## 📊 **Data Visualization Requirements**

### **Charts & Analytics**
```typescript
// Required chart types:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Heatmaps for patterns
- Progress indicators
- Real-time dashboards
```

## 🎯 **Specific Component Requirements**

### **Data Tables**
```typescript
// Features needed:
- Sorting on all columns
- Global and column-specific filtering
- Pagination with page size options
- Export to CSV/PDF
- Bulk selection and actions
- Responsive design
```

### **Forms**
```typescript
// Form requirements:
- Real-time validation
- Multi-step forms where needed
- File upload with progress
- Auto-save functionality
- Consistent styling
```

### **Modals & Overlays**
```typescript
// Modal requirements:
- Confirmation dialogs
- Form modals
- Image viewers
- Document previews
- AI chat overlay
```

## 🌐 **Responsive Design Specifications**

### **Breakpoints**
```css
Mobile: 320px - 768px
Tablet: 768px - 1024px  
Desktop: 1024px+
```

### **Mobile Optimizations**
- Collapsible sidebar becomes bottom navigation
- Touch-friendly button sizes (min 44px)
- Swipe gestures for navigation
- Optimized forms for mobile input

## 🔍 **Search & Navigation**

### **Global Search**
```typescript
// Search functionality:
- Universal search bar in header
- Search across students, teachers, classes
- Autocomplete suggestions
- Recent searches
- Search filters and categories
```

### **Navigation Structure**
```typescript
// Sidebar menu structure:
├── Dashboard
├── Users
│   ├── Students
│   ├── Teachers
│   ├── Parents
│   └── Admins
├── Academic
│   ├── Classes
│   ├── Subjects
│   ├── Timetable
│   └── Calendar
├── Attendance
├── Examinations
├── AI Hub
│   ├── Analytics
│   ├── Predictions
│   ├── Content Generator
│   ├── Assistant
│   └── Automation
├── Communications
├── Reports
└── Settings
```

## 🎨 **Visual Design Elements**

### **Color Palette**
```css
Primary: #2563eb (Blue)
Secondary: #059669 (Green)
Success: #10b981
Warning: #f59e0b
Error: #ef4444
Gray scale: #f8fafc to #1e293b
```

### **Typography**
```css
Font Family: Inter, system-ui, sans-serif
Headings: 600-700 weight
Body: 400-500 weight
Small text: 400 weight
```

## 🚀 **Performance Requirements**

### **Optimization Targets**
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms

### **Code Splitting**
- Route-based code splitting
- Component lazy loading
- AI features as separate chunks
- Chart libraries dynamically imported

## 🧪 **Additional Features**

### **Accessibility**
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus management
- ARIA labels and descriptions

### **Internationalization**
- Multi-language support (English, Hindi, Tamil, Telugu)
- RTL language support
- Date/time localization
- Number formatting

### **Offline Capabilities**
- Service worker implementation
- Offline data caching
- Sync when online
- Offline indicators

## 📝 **Development Guidelines**

### **Code Standards**
- TypeScript strict mode
- ESLint + Prettier configuration
- Conventional commits
- Component composition over inheritance
- Custom hooks for business logic

### **Testing Requirements**
- Unit tests for utilities
- Component testing with React Testing Library
- E2E tests for critical paths
- API integration tests

## 🎯 **Success Criteria**

The frontend should provide:
1. Intuitive user experience for all roles
2. Seamless AI integration with clear value
3. Real-time data updates and notifications
4. Comprehensive reporting and analytics
5. Mobile-responsive design
6. Fast, reliable performance
7. Accessible interface for all users

## 🔧 **Backend Integration Details**

### **Authentication Flow**
```typescript
// Login Process:
1. POST /api/auth/login with credentials
2. Receive JWT token in response
3. Store token securely (httpOnly cookie preferred)
4. Include "Authorization: Bearer <token>" in all API calls
5. Handle token refresh automatically
```

### **Role-Based Access**
```typescript
// User Roles and Permissions:
ADMIN: Full system access
- All AI endpoints
- User management
- System configuration
- Financial reports

TEACHER: Educational focused access
- AI analytics, predictions, content, behavior
- Class management
- Student records
- Grade entry

STUDENT: Personal data access
- Own performance data
- AI study assistance
- Assignment submissions
- Schedule viewing

PARENT: Child-focused access
- Children's academic data
- Communication with teachers
- Payment information
- Attendance reports
```

### **AI Services Integration**
```typescript
// Available AI Services:
1. Analytics: Student performance analysis
2. Predictions: Grade forecasting, risk assessment
3. Automation: Schedule optimization, task automation
4. Content Generation: Lesson plans, quizzes, assignments
5. Emergency Response: Crisis management, alert systems
6. Behavioral Analysis: Student behavior patterns
7. Resource Optimization: Classroom allocation, resource planning

// Each service returns structured data for UI consumption
```

## 📊 **Sample API Responses**

### **AI Analytics Response**
```json
{
  "success": true,
  "analytics": {
    "context": {
      "studentData": [...],
      "type": "student_performance",
      "subject": "Mathematics",
      "grade_level": "10th"
    },
    "serviceType": "analytics",
    "userId": "cmf9hohgy000iph63vcnpmbsx",
    "requestId": "uuid-string",
    "result": {
      "insights": "Performance analysis results...",
      "recommendations": [...],
      "charts": {
        "performance_trend": [...],
        "grade_distribution": [...]
      }
    }
  }
}
```

### **User Profile Response**
```json
{
  "id": "cmf9hohgy000iph63vcnpmbsx",
  "email": "admin@school.edu",
  "role": "ADMIN",
  "isActive": true,
  "profile": {
    "firstName": "School",
    "lastName": "Administrator",
    "phone": "+1234567890",
    "department": "Administration"
  }
}
```

## 🚀 **Deployment Considerations**

### **Environment Configuration**
```typescript
// Environment variables needed:
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_SCHOOL_NAME=Your School Name
REACT_APP_SCHOOL_LOGO_URL=/assets/logo.png
```

### **Build Optimization**
- Tree shaking for unused code
- Image optimization and lazy loading
- Bundle analysis and size monitoring
- CDN integration for static assets

## 📱 **Mobile App Considerations**

### **Progressive Web App (PWA)**
- Service worker for offline functionality
- App manifest for home screen installation
- Push notifications for important updates
- Background sync for data updates

### **Native-like Experience**
- Touch gestures and haptic feedback
- Smooth animations and transitions
- Native app shell loading
- Optimized for various screen sizes

## 🔐 **Security Best Practices**

### **Frontend Security**
```typescript
// Security measures to implement:
1. Content Security Policy (CSP) headers
2. XSS protection with input sanitization
3. CSRF protection for state-changing operations
4. Secure cookie handling for auth tokens
5. Input validation on all forms
6. Rate limiting for API calls
7. Proper error handling without exposing sensitive data
```

## 📈 **Analytics & Monitoring**

### **User Analytics**
- Page view tracking
- User interaction monitoring
- Performance metrics collection
- Error tracking and reporting
- A/B testing framework

### **AI Usage Analytics**
- AI service usage statistics
- Response time monitoring
- Success/failure rates
- User satisfaction metrics

Build this as a production-ready application that can handle 2000+ concurrent users with role-based access control and comprehensive AI-powered educational tools.

---

**Note**: This frontend will integrate seamlessly with the existing School ERP backend that includes:
- PostgreSQL database with comprehensive school data models
- JWT authentication with role-based authorization
- LangGraph-powered AI orchestrator with 7 specialized services
- Docker containerized deployment
- RESTful API with proper error handling and validation

The frontend should provide an intuitive, powerful interface that makes the AI capabilities accessible and valuable to all user types while maintaining security and performance standards.
