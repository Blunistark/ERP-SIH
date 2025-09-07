# School ERP Backend System

A comprehensive School ERP (Enterprise Resource Planning) backend system built with Express.js, TypeScript, Prisma ORM, and PostgreSQL. This system is designed to handle all aspects of school management including user management, class administration, attendance tracking, examination management, and more.

## 🚀 Features

### Core Modules
- **User Management**: Complete CRUD operations for Admin, Teacher, Student, and Parent roles
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Class Management**: Create and manage classes, sections, and academic years
- **Student Management**: Student enrollment, profile management, and academic tracking
- **Teacher Management**: Faculty management, subject assignments, and class allocations
- **Attendance System**: Daily attendance tracking with multiple status options
- **Examination Management**: Exam creation, result management, and grading system
- **Notice Board**: Announcement system with role-based targeting
- **School Settings**: Configurable school parameters and system settings

### Technical Features
- **TypeScript**: Full type safety and enhanced developer experience
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation using Joi
- **Internationalization**: Multi-language support (English + South Indian languages)
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Docker Support**: Complete containerization with Docker Compose
- **Error Handling**: Centralized error management with proper logging
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Helmet.js for security best practices

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Docker & Docker Compose (optional)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd school-erp-backend

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment variables
cp .env.example .env

# Update .env with your configuration
# DATABASE_URL="postgresql://username:password@localhost:5432/school_erp?schema=public"
# JWT_SECRET=your-super-secret-jwt-key
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

### 4. Start Development Server

```bash
# Start in development mode
npm run dev

# Or build and start production
npm run build
npm start
```

The server will be running at `http://localhost:3000`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services (app + database + redis)
docker-compose up -d

# Start with development profile (includes pgAdmin)
docker-compose --profile development up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build the image
docker build -t school-erp-backend .

# Run with external database
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  school-erp-backend
```

## 📚 API Documentation

Once the server is running, you can access:

- **API Documentation**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

### Default Login Credentials

After running the seed script, you can use these credentials:

```
Admin:    admin@school.edu / password123
Teacher:  teacher1@school.edu / password123
Parent:   parent1@email.com / password123
Student:  student1@school.edu / password123
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/change-password` - Change password

### User Management
- `GET /api/users` - Get all users (Admin/Teacher only)
- `POST /api/users` - Create new user (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Class Management
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class (Admin only)
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class (Admin only)
- `DELETE /api/classes/:id` - Delete class (Admin only)
- `POST /api/classes/:id/assign-teacher` - Assign teacher to class
- `DELETE /api/classes/:id/remove-teacher/:teacherId` - Remove teacher from class

### Additional Modules
- `/api/students` - Student management (Coming soon)
- `/api/teachers` - Teacher management (Coming soon)
- `/api/attendance` - Attendance tracking (Coming soon)
- `/api/exams` - Examination management (Coming soon)
- `/api/notices` - Notice management (Coming soon)
- `/api/settings` - School settings (Coming soon)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📁 Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   └── class.controller.ts
├── middleware/           # Custom middleware
│   ├── auth.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── i18n.ts
├── routes/              # API routes
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   └── class.routes.ts
├── utils/               # Utility functions
│   └── logger.ts
└── index.ts            # Application entry point

prisma/
├── schema.prisma       # Database schema
└── seed.ts            # Database seeding script
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js for HTTP security
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Environment Variables**: Secure configuration management

## 🌍 Internationalization

The system supports multiple languages with a focus on South Indian regional content:

- English (en) - Default
- Hindi (hi)
- Kannada (kn) - Karnataka
- Tamil (ta) - Tamil Nadu
- Telugu (te) - Andhra Pradesh/Telangana
- Malayalam (ml) - Kerala

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with the following main entities:

- **Users & Profiles**: User accounts with detailed profile information
- **Students**: Student-specific data with academic tracking
- **Teachers**: Faculty information with subject assignments
- **Parents**: Parent profiles linked to students
- **Classes & Sections**: Class organization and management
- **Academic Years & Terms**: Academic calendar management
- **Subjects**: Course/subject management
- **Attendance**: Daily attendance tracking
- **Exams & Results**: Examination and grading system
- **Notices**: Announcement and communication system
- **Settings**: School configuration parameters

## 🚀 Performance Considerations

- **Connection Pooling**: Prisma handles database connection pooling
- **Query Optimization**: Efficient database queries with proper indexing
- **Caching**: Redis integration ready for future implementation
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Pagination**: Large dataset handling with pagination support
- **Logging**: Comprehensive logging for monitoring and debugging

## 📈 Scalability Features

- **Modular Architecture**: Clean separation of concerns
- **Docker Support**: Easy deployment and scaling
- **Environment-based Configuration**: Different settings for dev/staging/production
- **Database Migrations**: Version-controlled schema changes
- **API Versioning**: Ready for future API versions
- **Microservice Ready**: Structured for potential microservice extraction

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact: support@schoolerp.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic project setup and architecture
- ✅ User management system
- ✅ Authentication and authorization
- ✅ Class management
- ✅ API documentation

### Phase 2 (Next)
- 🔄 Complete student management module
- 🔄 Teacher management with subject assignments
- 🔄 Attendance tracking system
- 🔄 Basic examination management

### Phase 3 (Future)
- 📅 Advanced examination and grading system
- 📅 Timetable management
- 📅 Fee management system
- 📅 Report generation
- 📅 Parent portal
- 📅 Mobile app API support
- 📅 Advanced analytics and dashboards

## ⚡ Performance Tips

1. **Database**: Use connection pooling and optimize queries
2. **Caching**: Implement Redis for frequently accessed data
3. **Monitoring**: Set up application monitoring (e.g., New Relic, DataDog)
4. **Load Balancing**: Use nginx or cloud load balancers for high traffic
5. **CDN**: Use CDN for static assets when adding frontend

---

**Built with ❤️ for modern educational institutions**
