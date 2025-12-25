# TY Project Launchpad - Backend API

Modern FastAPI backend with PostgreSQL for Final Year Engineering Project Management Platform.

## 🚀 Features

- **Authentication**: JWT-based authentication with secure password hashing
- **User Management**: Complete user registration and profile management
- **Project Management**: Create, track, and manage projects
- **Synopsis Upload**: Upload and manage project synopsis (PDF)
- **Orders & Plans**: Handle plan subscriptions and orders
- **Meetings**: Schedule and manage consultation meetings
- **Admin Panel**: Complete admin dashboard with stats and management
- **File Storage**: Secure file upload/download system
- **BlackBook**: Download project reference materials

## 📋 Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip (Python package manager)

## 🛠️ Installation

### 1. Install PostgreSQL

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tyforge_db;

# Exit
\q
```

### 3. Install Python Dependencies

```bash
cd backend_new
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/tyforge_db
SECRET_KEY=your-secret-key-here
ADMIN_EMAIL=admin@tyforge.com
ADMIN_PASSWORD=admin123
```

## 🎯 Running the Server

### Development Mode

```bash
python run.py
```

Or:

```bash
uvicorn app.main:app --reload
```

Server will start on: http://localhost:8000

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔑 Default Admin Credentials

```
Email: admin@tyforge.com
Password: admin123
```

**⚠️ Change these in production!**

## 📁 Project Structure

```
backend_new/
├── app/
│   ├── core/           # Core functionality (config, security, database)
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── routers/        # API endpoints
│   ├── services/       # Business logic
│   └── main.py         # FastAPI app
├── uploads/            # File storage
├── .env                # Environment variables
├── requirements.txt    # Python dependencies
└── run.py              # Run script
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/me` - Get my profile
- `PUT /api/users/me` - Update my profile
- `GET /api/users/` - Get all users (admin)

### Projects
- `GET /api/projects/` - Get my projects
- `POST /api/projects/` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Synopsis
- `POST /api/synopsis/upload` - Upload synopsis
- `GET /api/synopsis/` - Get my synopsis
- `GET /api/synopsis/{id}/download` - Download synopsis

### Orders
- `GET /api/orders/` - Get my orders
- `POST /api/orders/` - Create order

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/requests` - Get all requests
- `POST /api/admin/blackbook/upload` - Upload blackbook

## 🧪 Testing

Test the API using the built-in Swagger UI at `/docs` or use tools like:
- Postman
- curl
- httpie

Example test:
```bash
curl http://localhost:8000/health
```

## 🚢 Deployment

### Railway.app
1. Push to GitHub
2. Connect to Railway
3. Add PostgreSQL addon
4. Set environment variables
5. Deploy!

### Render.com
1. Push to GitHub
2. Create new Web Service
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| SECRET_KEY | JWT secret key | - |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |
| ADMIN_EMAIL | Admin email | admin@tyforge.com |
| ADMIN_PASSWORD | Admin password | admin123 |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License
