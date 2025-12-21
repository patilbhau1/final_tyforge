# 🚀 Quick Setup Guide - TY Project Launchpad Backend

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (use default settings)
3. Remember the password you set for the `postgres` user
4. Port: 5432 (default)

### Verify Installation
Open Command Prompt and run:
```bash
psql --version
```

## Step 2: Create Database

Open Command Prompt (or pgAdmin):
```bash
# Login to PostgreSQL
psql -U postgres

# Enter your postgres password when prompted

# Create database
CREATE DATABASE tyforge_db;

# Verify
\l

# Exit
\q
```

## Step 3: Install Python Dependencies

```bash
cd backend_new
pip install -r requirements.txt
```

## Step 4: Configure Environment

Edit the `.env` file and update your PostgreSQL password:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/tyforge_db
```

Replace `YOUR_PASSWORD_HERE` with your actual PostgreSQL password.

## Step 5: Run the Backend

```bash
python run.py
```

You should see:
```
============================================================
TY PROJECT LAUNCHPAD - Backend Server
============================================================
✅ Admin user created: admin@tyforge.com
✅ Plan created: Basic Plan
✅ Plan created: Standard Plan
✅ Plan created: Premium Plan
✅ Database initialization completed!

🚀 Starting server on http://localhost:8000
📚 API Documentation: http://localhost:8000/docs
============================================================
```

## Step 6: Test the Backend

### Option 1: Using Browser
Visit: http://localhost:8000/docs

You'll see the interactive API documentation!

### Option 2: Using Command Line
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

## 🔑 Default Admin Login

```
Email: admin@tyforge.com
Password: admin123
```

## 📍 Important URLs

- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## ⚠️ Troubleshooting

### Problem: "psql: command not found"
**Solution**: Add PostgreSQL to PATH or use pgAdmin GUI

### Problem: "FATAL: password authentication failed"
**Solution**: Check your password in `.env` file matches PostgreSQL password

### Problem: "database does not exist"
**Solution**: Run the CREATE DATABASE command in psql

### Problem: "Port 8000 already in use"
**Solution**: 
1. Find process: `netstat -ano | findstr :8000` (Windows)
2. Kill it: `taskkill /PID <PID> /F`

### Problem: "Module not found"
**Solution**: Make sure you're in the `backend_new` directory and run `pip install -r requirements.txt`

## 🧪 Test API Endpoints

### 1. Test Health Check
```bash
curl http://localhost:8000/health
```

### 2. Test Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User",
    "phone": "1234567890"
  }'
```

### 3. Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tyforge.com",
    "password": "admin123"
  }'
```

## 🎯 Next Steps

1. ✅ Backend is running
2. 🔄 Update frontend to connect to new backend
3. 🧪 Test all features
4. 🚀 Deploy to Railway/Render

## 💡 Tips

- Keep the terminal open while backend is running
- Press `Ctrl+C` to stop the server
- The server auto-reloads when you make code changes
- Check http://localhost:8000/docs for all available endpoints

---

**Need help?** Check the main README.md for detailed documentation.
