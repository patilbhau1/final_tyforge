# Production Setup Guide

## 🚨 CRITICAL: Security Configuration Before Deployment

### 1. Backend Configuration (backend_new/.env)

**Generate a new SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Update `backend_new/.env`:
```env
SECRET_KEY=<your-generated-secret-key-here>
ADMIN_PASSWORD=<strong-password-here>
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
```

### 2. Frontend Configuration (ty-project-launchpad-new-version/.env)

Update the following keys:

```env
# API Configuration - Update to your production API URL
VITE_API_BASE_URL=https://your-production-api.com

# Supabase Configuration (if using Google OAuth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# AI API Keys - Get new keys from providers
VITE_GROQ_API_KEY=<your-groq-api-key>
```

### 3. Exposed Keys to Replace

The following keys are currently exposed in the repository and MUST be replaced:

#### Frontend (.env):
- ❌ **VITE_GROQ_API_KEY** - Currently placeholder, get new key from: https://console.groq.com
- ⚠️  **VITE_SUPABASE_ANON_KEY** - Get from Supabase dashboard if using Google OAuth

#### Backend (.env):
- ✅ **SECRET_KEY** - Already updated with development key, generate new for production
- ⚠️  **ADMIN_PASSWORD** - Change from default "admin123"

### 4. Environment-Specific Configurations

#### Development
- CORS is permissive (allows all origins)
- Uses localhost URLs
- Debug logging enabled

#### Production
- CORS restricted to your frontend domain only
- HTTPS required
- Structured logging
- Rate limiting enabled

### 5. Pre-Deployment Checklist

- [ ] Generated new SECRET_KEY for backend
- [ ] Changed ADMIN_PASSWORD
- [ ] Updated DATABASE_URL with production credentials
- [ ] Replaced VITE_API_BASE_URL with production API URL
- [ ] Generated new GROQ API key (if using AI features)
- [ ] Configured Supabase for Google OAuth (if needed)
- [ ] Added production domain to CORS allowed origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable API rate limiting
- [ ] Configure monitoring and logging

### 6. Key Rotation

Rotate these keys regularly:
- SECRET_KEY: Every 90 days
- API Keys (GROQ, etc.): Every 6 months
- Admin Password: Every 30 days

### 7. .gitignore Configuration

Ensure `.env` files are in `.gitignore`:
```gitignore
.env
.env.local
.env.production
*.env
```

### 8. Deployment Commands

#### Backend
```bash
cd backend_new
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start with production server
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

#### Frontend
```bash
cd ty-project-launchpad-new-version
# Install dependencies
npm install

# Build for production
npm run build

# Preview build
npm run preview
```

## 🔒 Security Best Practices

1. **Never commit .env files** to version control
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** on all API endpoints
4. **Enable HTTPS** for all production traffic
5. **Regular security audits** and dependency updates
6. **Monitor logs** for suspicious activity
7. **Implement backup strategy** for database
8. **Use secrets management** service (AWS Secrets Manager, HashiCorp Vault, etc.)

## 📞 Support

For security concerns or questions, contact your security team immediately.
