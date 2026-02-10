# POS (Point of Sale) System

A modern, full-stack Point of Sale application designed for Kenyan grocery stores. Built with a Spring Boot backend and a Next.js/React frontend, this system provides comprehensive retail management capabilities including inventory management, order processing, product management, and user authentication.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Security](#authentication--security)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Testing](#testing)
- [Project Status](#project-status)
- [License](#license)

---

## Overview

This POS system is tailored for grocery store operations in Kenya, supporting multiple user roles (Admin, Cashier), product management with inventory tracking, and multiple payment methods including M-Pesa integration via the Daraja API. The system features a responsive web interface and RESTful API backend.

**Target Users:**
- Store Managers & Admins
- Cashiers
- Inventory Managers
- Store Owners

---

## Features

### Core Functionality
- **User Management**
  - User registration and authentication
  - Role-based access control (Admin, Cashier)
  - User profile management
  - Last login tracking

- **Product Management**
  - Create, read, update, and delete products
  - Product categorization by type
  - Weight-based pricing (price per kg)
  - Product image uploads
  - Product search functionality

- **Inventory Management**
  - Real-time stock tracking
  - Inventory quantity updates
  - Insufficient stock exception handling
  - Inventory reporting

- **Order Management**
  - Create and process orders
  - Multiple order items per order
  - Order status tracking (Pending, Processing, Completed, Cancelled)
  - Order history and reporting

- **Payment Processing**
  - Multiple payment methods (Cash, Card, M-Pesa)
  - M-Pesa integration via Daraja API
  - Payment status tracking

- **Barcode Scanning**
  - Quick product lookup via barcode scan
  - Scan service for point-of-sale operations

- **Security**
  - JWT (JSON Web Token) authentication
  - Spring Security integration
  - Password encryption
  - Secure API endpoints with authorization

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js/React)                │
│                     - Login Page                             │
│                     - Admin Dashboard                        │
│                     - Cashier Interface                      │
│                     - Product Management                     │
└────────────────────────┬────────────────────────────────────┘
                         │ (HTTP/REST API)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Backend (Spring Boot REST API)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Controllers                                          │  │
│  │ - AuthController  - ProductController               │  │
│  │ - OrderController - InventoryController             │  │
│  │ - UserController  - ScanController                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Services (Business Logic)                            │  │
│  │ - AuthService    - ProductService                   │  │
│  │ - OrderService   - InventoryService                 │  │
│  │ - UserService    - ScanService                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Repositories (Data Access)                           │  │
│  │ - UserRepository  - ProductRepository               │  │
│  │ - OrderRepository - InventoryRepository             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Security & Configuration                             │  │
│  │ - JwtProvider/Validator - SecurityConfig            │  │
│  │ - WebConfig                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────────────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
┌──────▼──────┐ ┌──────▼──────┐ ┌───▼─────────┐
│   MySQL DB  │ │ Daraja API  │ │  File Store │
│  (JPA)      │ │  (M-Pesa)   │ │  (Images)   │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## Tech Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Spring Boot | 3.4.1 |
| Language | Java | 21 |
| Database ORM | JPA/Hibernate | Latest |
| Database Driver | MySQL Connector | Latest |
| Authentication | Spring Security | Latest |
| JWT | JJWT | 0.11.5 |
| Build Tool | Maven | Latest |
| Project Utilities | Lombok | 1.18.30 |
| Payment API | Daraja (M-Pesa) | 2.0.2 |
| Testing | JUnit + Spring Test | Latest |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.1.4 |
| Library | React | 19.2.3 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| Icons | Lucide React & React Icons | Latest |
| Runtime | Node.js | 18+ |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Container | Docker |
| Container Base | Eclipse Temurin JDK 23 |
| API Protocol | REST (HTTP/HTTPS) |

---

## Project Structure

```
POS/
├── src/
│   ├── main/
│   │   ├── java/Retail/POS/
│   │   │   ├── PosApplication.java         # Spring Boot entry point
│   │   │   ├── controller/                 # REST API endpoints
│   │   │   │   ├── AuthController
│   │   │   │   ├── ProductController
│   │   │   │   ├── OrderController
│   │   │   │   ├── InventoryController
│   │   │   │   ├── UserController
│   │   │   │   └── ScanController
│   │   │   ├── service/                    # Business logic layer
│   │   │   │   ├── AuthService
│   │   │   │   ├── ProductService
│   │   │   │   ├── OrderService
│   │   │   │   ├── InventoryService
│   │   │   │   ├── UserService
│   │   │   │   ├── ScanService
│   │   │   │   ├── StoreService
│   │   │   │   └── impl/                   # Service implementations
│   │   │   ├── repository/                 # JPA Repository interfaces
│   │   │   │   ├── UserRepository
│   │   │   │   ├── ProductRepository
│   │   │   │   ├── OrderRepository
│   │   │   │   └── InventoryRepository
│   │   │   ├── models/                     # JPA Entity classes
│   │   │   │   ├── User
│   │   │   │   ├── Product
│   │   │   │   ├── Order
│   │   │   │   ├── OrderItem
│   │   │   │   ├── Inventory
│   │   │   │   └── Store
│   │   │   ├── payload/
│   │   │   │   ├── dto/                    # Data Transfer Objects
│   │   │   │   │   ├── UserDto
│   │   │   │   │   ├── ProductDto
│   │   │   │   │   ├── OrderDto
│   │   │   │   │   ├── CartDto
│   │   │   │   │   └── ...
│   │   │   │   └── response/               # API Response objects
│   │   │   ├── mapper/                     # DTO mappers
│   │   │   │   ├── UserMapper
│   │   │   │   ├── ProductMapper
│   │   │   │   ├── OrderMapper
│   │   │   │   └── InventoryMapper
│   │   │   ├── config/                     # Configuration classes
│   │   │   │   ├── SecurityConfig
│   │   │   │   ├── JwtProvider
│   │   │   │   ├── JwtValidator
│   │   │   │   ├── JwtConstant
│   │   │   │   └── WebConfig
│   │   │   ├── domain/                     # Enums
│   │   │   │   ├── UserRole (ADMIN, CASHIER)
│   │   │   │   ├── OrderStatus (PENDING, PROCESSING, COMPLETED, CANCELLED)
│   │   │   │   ├── PaymentMethod (CASH, CARD, MPESA)
│   │   │   │   └── ProductType
│   │   │   └── exceptions/                 # Custom exceptions
│   │   │       ├── UserException
│   │   │       └── InsufficientStockException
│   │   └── resources/
│   │       ├── application.properties      # Configuration
│   │       └── application.yml
│   └── test/
│       ├── java/Retail/POS/
│       │   └── PosApplicationTests.java
│       └── resources/
│           └── application-test.properties
├── Dockerfile                              # Container image definition
├── pom.xml                                 # Maven dependencies
├── mvnw / mvnw.cmd                         # Maven wrapper scripts
└── TODO.md                                 # Testing roadmap

UI/
└── pos/
    ├── app/
    │   ├── layout.tsx                      # Root layout
    │   ├── page.tsx                        # Home page (redirects to login)
    │   ├── login/
    │   │   └── page.tsx                    # Login interface
    │   ├── admin/
    │   │   └── page.tsx                    # Admin dashboard
    │   └── cashier/
    │       └── page.tsx                    # Cashier POS interface
    ├── lib/
    │   └── api-service.ts                  # API client utilities
    ├── public/
    │   └── images/                         # Static assets
    ├── package.json                        # Dependencies
    ├── tsconfig.json                       # TypeScript config
    ├── next.config.ts                      # Next.js config
    ├── postcss.config.mjs                  # PostCSS config
    ├── tailwind.config.ts                  # Tailwind CSS config
    └── eslint.config.mjs                   # ESLint config
```

---

## Prerequisites

### System Requirements
- **Operating System:** Linux, macOS, or Windows
- **Disk Space:** Minimum 2GB free space

### Backend Requirements
- **Java:** JDK 21 or higher
- **Maven:** 3.6.0 or higher (or use included `mvnw`)
- **MySQL:** 8.0 or higher
- **Git:** Latest version

### Frontend Requirements
- **Node.js:** 18.0 or higher
- **npm:** 8.0 or higher (or yarn/pnpm)
- **Git:** Latest version

### Optional
- **Docker:** For containerized deployment
- **Docker Compose:** For multi-container orchestration

---

## Installation & Setup

### Backend Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pos-system.git
cd pos
cd POS
```

#### 2. Create MySQL Database
```sql
CREATE DATABASE pos_db;
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON pos_db.* TO 'pos_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Configure Environment Variables
Create a `.env` file in the `POS/` directory:
```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/pos_db
SPRING_DATASOURCE_USERNAME=pos_user
SPRING_DATASOURCE_PASSWORD=secure_password
APP_JWT_SECRET=your-secret-key-here-min-32-characters
SERVER_PORT=8080
```

Or update `src/main/resources/application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
spring.datasource.url=jdbc:mysql://localhost:3306/pos_db
spring.datasource.username=pos_user
spring.datasource.password=secure_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.show-sql=true
app.jwt.secret=your-secret-key-here-min-32-characters
server.port=8080
```

#### 4. Build the Backend
```bash
# Using Maven wrapper (recommended)
./mvnw clean install

# Or using Maven if installed globally
mvn clean install
```

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd ../UI/pos
```

#### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 3. Configure Environment
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Update [lib/api-service.ts](lib/api-service.ts) with your API endpoints if needed.

#### 4. Build Frontend (Optional)
```bash
npm run build
```

---

## Configuration

### Backend Configuration

**JWT Configuration** ([src/main/java/Retail/POS/config/JwtConstant.java](src/main/java/Retail/POS/config/JwtConstant.java)):
- Secret key: Set via `APP_JWT_SECRET` environment variable
- Token expiration: Configure in JwtProvider/JwtValidator
- Algorithm: HMAC SHA-256

**Security Configuration** ([src/main/java/Retail/POS/config/SecurityConfig.java](src/main/java/Retail/POS/config/SecurityConfig.java)):
- CORS enabled for frontend origin
- JWT filter for request authentication
- Endpoint security rules

**Database Configuration**:
- Automatic schema creation/update via Hibernate
- MySQL 8.0+ compatibility
- Connection pooling configured

### Frontend Configuration

**API Base URL**: Configure in `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**Tailwind CSS**: Configuration in [postcss.config.mjs](postcss.config.mjs) and styling in [app/globals.css](app/globals.css)

---

## Running the Application

### Option 1: Development Mode

#### Backend
```bash
cd POS
./mvnw spring-boot:run
# Backend runs on http://localhost:8080
```

#### Frontend (in a new terminal)
```bash
cd UI/pos
npm run dev
# Frontend runs on http://localhost:3000
```

### Option 2: Production Build

#### Backend
```bash
cd POS
./mvnw clean package
java -jar target/POS-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd UI/pos
npm run build
npm run start
```

### Option 3: Docker

#### Build and Run
```bash
# Build backend image
cd POS
docker build -t pos-backend:latest .

# Run backend container
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/pos_db \
  -e SPRING_DATASOURCE_USERNAME=pos_user \
  -e SPRING_DATASOURCE_PASSWORD=secure_password \
  -e APP_JWT_SECRET=your-secret-key \
  pos-backend:latest

# Build and run frontend
cd UI/pos
docker build -t pos-frontend:latest .
docker run -p 3000:3000 pos-frontend:latest
```

---

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+254712345678",
  "role": "CASHIER"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "success": true
}
```

### Product Endpoints

#### Create Product
```http
POST /products/create
Authorization: Bearer {jwt}
Content-Type: application/json

{
  "name": "Maize Flour",
  "code": "MF001",
  "description": "2kg pack",
  "sellingPrice": 150.00,
  "type": "FOOD",
  "pricePerKg": 75.00
}
```

#### Search Products
```http
GET /products/search?keyword=maize
Authorization: Bearer {jwt}
```

#### Update Product
```http
PATCH /products/{id}
Authorization: Bearer {jwt}
Content-Type: application/json

{
  "name": "Maize Flour Premium",
  "sellingPrice": 160.00
}
```

#### Delete Product
```http
DELETE /products/{id}
Authorization: Bearer {jwt}
```

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer {jwt}
Content-Type: application/json

{
  "orderItems": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 150.00
    }
  ],
  "paymentMethod": "CASH",
  "totalAmount": 300.00
}
```

### Inventory Endpoints

#### Update Inventory
```http
POST /inventory/update
Authorization: Bearer {jwt}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 50
}
```

### Scan Endpoints

#### Scan Product
```http
POST /scan/{barcode}
Authorization: Bearer {jwt}
```

**Full API specification** coming in future releases with OpenAPI/Swagger documentation.

---

## Database Schema

### Entity Relationships

```
User
├─ id (PK)
├─ fullName
├─ email (UNIQUE)
├─ phone
├─ password
├─ role (ENUM: ADMIN, CASHIER)
├─ createdAt
├─ updatedAt
└─ lastLogin

Product
├─ id (PK)
├─ name
├─ code (UNIQUE)
├─ description
├─ sellingPrice
├─ image
├─ type (ENUM: FOOD, BEVERAGE, HOUSEHOLD, etc.)
├─ pricePerKg
├─ createdAt
└─ updatedAt

Order
├─ id (PK)
├─ totalAmount
├─ createdAt
├─ paymentMethod (ENUM: CASH, CARD, MPESA)
├─ status (ENUM: PENDING, PROCESSING, COMPLETED, CANCELLED)
└─ orderItems (1:N relationship)

OrderItem
├─ id (PK)
├─ orderId (FK)
├─ productId (FK)
├─ quantity
└─ price

Inventory
├─ id (PK)
├─ productId (FK)
├─ quantity
├─ lastRestocked
└─ warehouseLocation

Store
├─ id (PK)
├─ name
├─ location
├─ phone
└─ email
```

---

## Authentication & Security

### JWT Authentication
- **Algorithm:** HS256 (HMAC SHA-256)
- **Expiration:** Configured in JwtValidator
- **Claims:** User ID, Email, Role, Issue Time, Expiration Time
- **Storage (Frontend):** LocalStorage or SessionStorage

### Password Security
- Passwords are encrypted using Spring Security's BCryptPasswordEncoder
- Minimum password requirements recommended:
  - Minimum 8 characters
  - Mix of uppercase and lowercase letters
  - Numeric characters
  - Special characters

### Authorization
- **Role-Based Access Control (RBAC)**
  - `ADMIN`: Full system access, user management
  - `CASHIER`: POS operations, order creation, product viewing

### CORS Configuration
- Configured in [config/WebConfig.java](config/WebConfig.java)
- Frontend URL whitelisted for cross-origin requests

### Secure Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security: max-age=31536000

---

## Development Workflow

### Frontend Development
```bash
cd UI/pos
npm run dev
# Runs on http://localhost:3000 with hot reload
```

### Backend Development
```bash
cd POS
./mvnw spring-boot:run
# Runs on http://localhost:8080 with auto-restart (if using spring-boot-devtools)
```

### Code Style
- **Backend:** Follow Google Java Style Guide
- **Frontend:** Follow Airbnb React/TypeScript style guide
- Use ESLint: `npm run lint`

### Git Workflow
```bash
git checkout -b feature/feature-name
# Make changes
git add .
git commit -m "feat: add feature description"
git push origin feature/feature-name
# Create Pull Request
```

---

## Deployment

### Docker Deployment

1. **Build Backend Image:**
```bash
cd POS
docker build -t pos-backend:latest .
```

2. **Build Frontend Image:**
```dockerfile
# Create Dockerfile in UI/pos/
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
cd UI/pos
docker build -t pos-frontend:latest .
```

3. **Docker Compose (Optional):**
```yaml
version: '3.8'
services:
  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: pos_db
      MYSQL_USER: pos_user
      MYSQL_PASSWORD: secure_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build:
      context: ./POS
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://database:3306/pos_db
      SPRING_DATASOURCE_USERNAME: pos_user
      SPRING_DATASOURCE_PASSWORD: secure_password
      APP_JWT_SECRET: your-secret-key
    depends_on:
      - database

  frontend:
    build:
      context: ./UI/pos
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:8080/api
    depends_on:
      - backend

volumes:
  mysql_data:
```

```bash
docker-compose up -d
```

### Cloud Deployment

**AWS/Azure/Google Cloud:**
- Push images to container registry (ECR, ACR, GCR)
- Use managed Kubernetes (EKS, AKS, GKE) or App Service
- Use managed databases (RDS, Azure Database, Cloud SQL)
- Configure CI/CD pipelines with GitHub Actions, AWS CodePipeline, etc.

---

## Testing

### Test Plan ([TODO.md](TODO.md))

The project includes comprehensive test coverage:
- Unit tests for services, mappers, and entities
- Integration tests for controllers and repositories
- Configuration tests for JWT and security
- End-to-end tests for critical workflows

### Run Tests
```bash
cd POS
./mvnw test
```

### View Test Reports
```bash
# Tests are executed in the build phase
./mvnw clean test
# Reports in: target/surefire-reports/
```

### Frontend Testing (Future)
```bash
cd UI/pos
npm test
```

---

## Project Status

### Completed
- [x] Project structure and architecture
- [x] Backend API endpoints
- [x] JWT authentication and security configuration
- [x] Database models and relationships
- [x] Core service logic
- [x] Frontend layout and routing
- [x] Docker containerization

### In Progress
- [ ] Test suite implementation
- [ ] Frontend UI components
- [ ] Payment gateway integration (M-Pesa)

### Planned
- [ ] Swagger/OpenAPI documentation
- [ ] Admin analytics dashboard
- [ ] Advanced reporting features
- [ ] Mobile app version
- [ ] Inventory forecasting
- [ ] Multi-store management

For detailed testing roadmap, see [TODO.md](TODO.md)

---

## License

This project is proprietary software. All rights reserved.

---

## Contributing

Contributions are welcome! Please follow the development workflow outlined above:

1. Create a feature branch
2. Commit changes with clear messages
3. Push to your fork
4. Create a pull request with description

---

## Troubleshooting

### Common Issues

**Backend fails to start:**
```
ERROR: unable to connect to database
```
- Check MySQL is running
- Verify connection credentials in application.properties
- Ensure database `pos_db` is created

**Frontend can't reach backend:**
```
Network Error: Failed to fetch API
```
- Verify backend is running on port 8080
- Check CORS configuration in SecurityConfig
- Ensure NEXT_PUBLIC_API_BASE_URL is correct

**JWT authentication fails:**
```
Invalid JWT token
```
- Verify JWT secret matches between frontend and backend
- Check token hasn't expired
- Ensure Authorization header format: `Bearer {token}`

**Port already in use:**
```bash
# Kill process using port 8080 (backend)
lsof -i :8080
kill -9 <PID>

# Kill process using port 3000 (frontend)
lsof -i :3000
kill -9 <PID>
```

---

## Support & Contact

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check documentation for updates

---

## Quick Links

- **Project Repository:** [GitHub Link]
- **Issue Tracker:** [GitHub Issues]
- **Documentation:** See project files
- **Wiki:** [Coming Soon]

---

**Last Updated:** February 10, 2026
**Version:** 0.0.1 (SNAPSHOT)
**Authors:** Davis Mutuku and Jesse Kariuki

