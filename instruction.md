
## AI Agent Instruction: School ERP Express Backend

**Build an Express.js backend for a school ERP system with the following requirements:**

### Project Scope & Stack
- **Domain**: School ERP — support for one school, user roles: admin, teacher, student, parent.
- **Database**: PostgreSQL (managed via Prisma ORM).
- **Authentication**: JWT with password login.
- **Backend only**: Focus on robust API, REST principles preferred, no client-facing frontend.
- **Scalability**: Modular structure, cloud and Docker readiness.
- **Localization**: Prepare for South Indian regional content (language keys, formatting).
- **User Load**: Design for 2000+ concurrent users.

### Core Domain Modules
- User Management: CRUD for all roles (admin, teacher, student, parent) with role-based access.
- Classes & Sections: Assign teachers, enroll students, manage timetables.
- Attendance: Daily, per student or class; accessible by admins, teachers, parents.
- Grades/Exams: Assessment module with results access for students, parents, and admins.
- Notices/Announcements: Admin to all or filtered user groups.
- Settings: Data related to school year, terms, and system configuration.

### Tech & Architecture
- Use Express.js with TypeScript for strong typing and maintainability.
- Integrate Prisma ORM with PostgreSQL, following best schema/relations practice.[3][5]
- Implement JWT authentication with secure password hashing (bcrypt).
- Modularize by features: routes, controllers, services, and Prisma models/files per resource.
- Use environment variables for secrets and DB connections.
- Write localization middleware (i18n), initializing with English, and include placeholders for major South Indian languages.
- Prepare Dockerfile and docker-compose.yml for both app and Postgres services.[5][1]

### Best Practice Guidelines
- Compose clear OpenAPI (Swagger) documentation for all endpoints.
- Apply best security practices: data validation, input sanitization, password policies.
- Make DB queries via Prisma—avoid raw SQL unless absolutely necessary.
- Include unit and integration tests for endpoints and business logic.
- Structure for future integration: make notification and payment systems pluggable.
- Scaffold with clean code structure: src/routes, src/controllers, src/services, src/models, src/middleware.
- Seed initial data and provide migration scripts via Prisma.
- Use GitHub Actions or similar for CI/CD prep (optional but recommended).

### Example Reference Models (Prisma schema)
- User: id, name, email, password hash, role
- Student: id, profile info, parentId, class assignment
- Teacher: id, subjects, assigned classes
- Class: id, grade, section, assigned teachers and students
- Attendance: id, studentId, date, status
- Exam/Grade: id, studentId, subjectId, marks, grade

**Deliverables:** Initial project scaffold with basic setup and at least one fully functional domain module (e.g., Users or Classes), Docker and localization scaffolding, and OpenAPI endpoint documentation.

**Reference top school ERP backend open source projects for best practice architecture and endpoint design**.[2][4][1]
