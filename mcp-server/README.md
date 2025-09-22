# ERP MCP Server

A Model Context Protocol (MCP) server for database queries using Prisma, designed to provide safe and controlled access to the ERP database.

## Features

- **Raw SQL Query Execution**: Execute custom SQL queries with parameter binding
- **Schema Introspection**: Get database schema information and table structures
- **CRUD Operations**: Perform create, read, update, delete operations on tables
- **Docker Support**: Containerized deployment with PostgreSQL
- **Type Safety**: Full TypeScript support with Prisma client
- **Security**: CORS protection and input validation

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### Execute Raw SQL Query
```
POST /api/mcp/query
Content-Type: application/json

{
  "query": "SELECT * FROM users WHERE role = $1",
  "params": ["ADMIN"]
}
```

### Get Database Schema
```
GET /api/mcp/schema
```
Returns complete database schema information.

### Get Tables List
```
GET /api/mcp/tables
```
Returns list of all tables in the database.

### Execute CRUD Operations
```
POST /api/mcp/execute
Content-Type: application/json

{
  "operation": "select|insert|update|delete",
  "table": "users",
  "data": { "email": "user@example.com", "role": "STUDENT" },
  "where": { "id": "user-id" }
}
```

## Supported Operations

### Query Operations
- `select`: Retrieve records from a table
- `insert`: Create new records
- `update`: Modify existing records
- `delete`: Remove records

### Query Examples

#### Select Users
```json
{
  "operation": "select",
  "table": "users",
  "where": {
    "role": "STUDENT",
    "isActive": true
  }
}
```

#### Insert Academic Year
```json
{
  "operation": "insert",
  "table": "academic_years",
  "data": {
    "year": "2024-2025",
    "startDate": "2024-08-01T00:00:00.000Z",
    "endDate": "2025-07-31T00:00:00.000Z",
    "isCurrent": false
  }
}
```

#### Update Student
```json
{
  "operation": "update",
  "table": "students",
  "data": {
    "classId": "new-class-id"
  },
  "where": {
    "rollNumber": "STU001"
  }
}
```

#### Delete Notice
```json
{
  "operation": "delete",
  "table": "notices",
  "where": {
    "id": "notice-id"
  }
}
```

## Setup and Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Docker (optional)

### Local Development

1. **Clone and install dependencies:**
```bash
cd mcp-server
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Set up database:**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Start development server:**
```bash
npm run dev
```

### Docker Deployment

1. **Build and run with Docker Compose:**
```bash
docker-compose up -d
```

2. **Check logs:**
```bash
docker-compose logs -f mcp-server
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:5173` |
| `JWT_SECRET` | JWT signing secret | Required for auth |

## Database Schema

The server uses Prisma ORM with the following main models:
- `User` - System users with roles
- `Student` - Student information
- `Teacher` - Teacher information
- `Parent` - Parent information
- `AcademicYear` - Academic year management
- `Class` - Class information
- `Subject` - Subject definitions
- `Attendance` - Attendance records
- `Exam` - Exam definitions
- `Grade` - Grade records

## Security Considerations

- All endpoints validate input data
- SQL injection protection through parameterized queries
- CORS protection enabled
- Rate limiting recommended for production
- Authentication middleware can be added for protected endpoints

## Development

### Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Project Structure

```
mcp-server/
├── src/
│   └── index.ts          # Main server file
├── prisma/
│   └── schema.prisma     # Database schema
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── .env                  # Environment variables
```

## API Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "data": { ... } | [...],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": "error message (if success is false)"
}
```

## Error Handling

The server provides comprehensive error handling:
- Database connection errors
- Invalid query parameters
- Schema validation errors
- SQL execution errors

All errors are logged and returned with appropriate HTTP status codes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.