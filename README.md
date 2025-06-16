# 🚀 Ynov Network API

A modern, scalable Node.js REST API for the Ynov Network social platform, built with TypeScript, Express, and PostgreSQL.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🌟 Overview

Ynov Network API is the backend service powering a university social network platform. It provides authentication, user management, posts, comments, likes, messaging, and more.

**Live API**: https://ynov-network-api.onrender.com

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- University email verification
- Role-based access control (Student, Admin, Moderator)
- Password reset and email verification

### 👥 User Management
- User profiles with avatars
- Follow/Unfollow system
- User search and discovery
- Profile customization

### 📝 Content Management
- Create, edit, delete posts
- Rich text content support
- Image/media upload via Cloudinary
- Hashtag system
- Post search and filtering

### 💬 Social Features
- Comments on posts
- Like/Unlike system
- Real-time notifications
- Direct messaging
- Groups and communities

### 🛡️ Moderation
- Content reporting system
- Automated content moderation
- Admin dashboard
- User suspension/ban system

### 📊 Analytics
- User engagement tracking
- Content performance metrics
- Platform usage statistics

## 🛠️ Tech Stack

### Core
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth

### Services & Integrations
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Real-time**: Socket.io
- **Validation**: Zod
- **API Documentation**: OpenAPI/Swagger

### Development Tools
- **Build Tool**: TSUp
- **Code Quality**: Biome (ESLint + Prettier)
- **Testing**: Vitest
- **Process Manager**: PM2
- **Development**: TSX with hot reload

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL 14+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ynov-Network-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
Production: https://ynov-network-api.onrender.com
Development: http://localhost:3000
```

### Authentication Endpoints

#### POST `/api/auth/sign-up`
Register a new user account.

**Request Body:**
```json
{
  "university_email": "student@ynov.com",
  "password": "securePassword123",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "student@ynov.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### POST `/api/auth/sign-in`
Authenticate user and get access token.

**Request Body:**
```json
{
  "university_email": "student@ynov.com",
  "password": "securePassword123"
}
```

### Posts Endpoints

#### GET `/api/posts`
Get paginated list of posts.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort order (latest, popular)

#### POST `/api/posts`
Create a new post.

**Request Body:**
```json
{
  "content": "This is my post content",
  "hashtags": ["#ynov", "#student"],
  "media_urls": ["https://cloudinary.com/image.jpg"]
}
```

#### POST `/api/posts/:id/like`
Like or unlike a post.

### Users Endpoints

#### GET `/api/users/profile`
Get current user profile.

#### PUT `/api/users/profile`
Update user profile.

#### GET `/api/users/:id`
Get user by ID.

For complete API documentation, visit: `/api/docs` when running the server.

## 📁 Project Structure

```
src/
├── index.ts                 # Application entry point
├── config/
│   ├── config.ts           # Configuration management
│   └── database.ts         # Database connection
├── db/
│   ├── index.ts            # Database exports
│   └── schemas/            # Drizzle ORM schemas
│       ├── users.ts
│       ├── posts.ts
│       ├── comments.ts
│       └── ...
├── lib/
│   ├── auth.ts             # Authentication utilities
│   ├── cloudinary.ts       # File upload service
│   ├── env.ts              # Environment validation
│   └── socket.ts           # WebSocket configuration
├── services/
│   ├── auth/               # Authentication services
│   ├── posts/              # Post management
│   ├── users/              # User management
│   ├── comments/           # Comment system
│   ├── notifications/      # Notification system
│   ├── email/              # Email services
│   └── moderation/         # Content moderation
├── common/
│   └── middleware/         # Express middlewares
└── types/                  # TypeScript type definitions
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ynov_network

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Better Auth
BETTER_AUTH_SECRET=your-better-auth-secret
BETTER_AUTH_URL=http://localhost:3000
```

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run Biome linter
npm run lint:fix     # Fix linting issues
npm run format       # Format code

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run coverage     # Generate test coverage report

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Drizzle Studio
```

### Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/your-feature-name
   npm run dev
   # Make your changes
   npm run test
   npm run lint
   ```

2. **Database Changes**
   ```bash
   # Modify schemas in src/db/schemas/
   npm run db:generate  # Generate migrations
   npm run db:migrate   # Apply migrations
   ```

3. **API Testing**
   - Use tools like Postman, Insomnia, or Thunder Client
   - Import the OpenAPI spec from `/api/docs`
   - Test endpoints with proper authentication headers

### Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing project structure
- Write tests for new features
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Follow RESTful API conventions

## 🚀 Deployment

### Production Deployment (Render)

1. **Environment Setup**
   - Set all required environment variables in Render dashboard
   - Configure PostgreSQL database
   - Set up Cloudinary account

2. **Build Configuration**
   ```bash
   Build Command: npm run build
   Start Command: npm start
   ```

3. **Health Checks**
   The API includes health check endpoints:
   - `GET /health` - Basic health check
   - `GET /api/health` - Detailed system status

### Docker Deployment

```dockerfile
# Use the official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Database Migrations

For production deployments, run migrations:
```bash
npm run db:migrate
```

## 📊 Monitoring & Logging

### Application Monitoring
- Health check endpoints for uptime monitoring
- Error tracking and logging
- Performance metrics collection
- Database connection monitoring

### Logging Levels
- `error`: System errors and exceptions
- `warn`: Warning messages and deprecations
- `info`: General application information
- `debug`: Detailed debugging information

## 🔒 Security

### Security Features
- JWT token authentication with expiration
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection

### Security Best Practices
- Keep dependencies updated
- Use HTTPS in production
- Validate all user inputs
- Implement proper error handling
- Regular security audits
- Monitor for suspicious activities

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

### Contribution Guidelines
- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include relevant logs and error messages
- Specify your environment details

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](./LICENSE) file for details.

## 🆘 Support

### Documentation
- API Documentation: `/api/docs`
- Database Schema: Use `npm run db:studio`
- Code Documentation: JSDoc comments in source

### Getting Help
- Check existing GitHub issues
- Review the documentation
- Join our Discord community
- Contact the development team

### Development Team
- **Backend Lead**: Development Team
- **DevOps**: Infrastructure Team
- **QA**: Quality Assurance Team

---

**Built with ❤️ for the Ynov Community**

Last updated: June 2025
