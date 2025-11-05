# Plant & Protect REST API

A production-ready REST API built with **Express.js**, **TypeScript**, **MongoDB**, following **Domain-Driven Design (DDD)** and **SOLID principles**.

## 🏗️ Architecture

This project implements Clean Architecture with the following layers:

### 1. Domain Layer (`src/domain/`)
- **Entities**: Core business objects (User, Tree, Fire)
- **Value Objects**: Immutable objects (Email, Location, TreeStatus)
- **Repository Interfaces**: Contracts for data access
- **Domain Services**: Business logic that doesn't fit in entities

### 2. Application Layer (`src/application/`)
- **Use Cases**: Application-specific business rules
- **DTOs**: Data transfer objects for use case inputs/outputs
- **Interfaces**: Contracts for external services

### 3. Infrastructure Layer (`src/infrastructure/`)
- **Database**: MongoDB models and repository implementations
- **Auth**: JWT and Google OAuth services
- **External APIs**: Third-party service integrations

### 4. Presentation Layer (`src/presentation/`)
- **Controllers**: HTTP request handlers
- **Routes**: API endpoint definitions
- **Middlewares**: Authentication, validation, error handling
- **Validators**: Request validation rules

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/plant-protect-api.git
cd plant-protect-api
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB installation
mongod
```

5. Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:8000/api/v1`

## 📚 API Documentation

### Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.plant-protect.com/api/v1
```

### Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer {access_token}
```

### Endpoints

#### Authentication
- `GET /auth/google/callback?code={code}` - Google OAuth callback
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

#### Trees
- `GET /trees` - Get all trees
- `POST /trees` - Plant a new tree
- `POST /trees/:treeId/water` - Water a tree

#### Fires
- `GET /fires` - Get fire reports
- `POST /fires` - Report a fire

#### Users
- `GET /users/:userId` - Get user profile
- `PUT /users/:userId` - Update user profile

See complete API documentation in the `/docs` folder.

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Watch mode:
```bash
npm run test:watch
```

## 🔒 SOLID Principles

- **S**ingle Responsibility: Each class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable for their base types
- **I**nterface Segregation: Clients shouldn't depend on interfaces they don't use
- **D**ependency Inversion: Depend on abstractions, not concretions

## 📦 Project Structure

```
src/
├── domain/              # Business logic & entities
├── application/         # Use cases & application services
├── infrastructure/      # External concerns (DB, APIs)
├── presentation/        # HTTP controllers & routes
├── shared/             # Common utilities
└── config/             # Configuration files
```

## 🛠️ Development

### Code Style
```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors
npm run format      # Format code with Prettier
npm run typecheck   # Type checking
```

### Build
```bash
npm run build      # Compile TypeScript to JavaScript
npm start          # Run production build
```

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributors

- Plant & Protect Team

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request