# Database Migration Commands

Quick reference for managing database migrations with Alembic.

## Setup (First Time)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# 3. Create initial migration
alembic revision --autogenerate -m "Initial schema with tracking tables"

# 4. Apply migrations
alembic upgrade head
```

## Common Commands

### Create New Migration
```bash
# After modifying models, create a migration
alembic revision --autogenerate -m "Description of changes"

# Example:
alembic revision --autogenerate -m "Add soft delete to projects"
```

### Apply Migrations
```bash
# Upgrade to latest version
alembic upgrade head

# Upgrade one version at a time
alembic upgrade +1
```

### Rollback Migrations
```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>

# Rollback all
alembic downgrade base
```

### View Migration History
```bash
# Show current version
alembic current

# Show all migrations
alembic history

# Show pending migrations
alembic history --verbose
```

## Production Deployment

### Option 1: Using migrate_db.py (Recommended)
```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://...pooler...neon.tech/neondb?sslmode=require"

# Run migrations
python migrate_db.py
```

### Option 2: Direct Alembic Command
```bash
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" alembic upgrade head
```

## Troubleshooting

### Issue: "Can't locate revision identified by..."
```bash
# Reset to base and reapply all
alembic downgrade base
alembic upgrade head
```

### Issue: "Target database is not up to date"
```bash
# Check current version
alembic current

# Force stamp to specific version
alembic stamp head
```

### Issue: "Connection refused"
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Should look like:
# postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Test connection
psql "$DATABASE_URL" -c "SELECT 1"
```

## Best Practices

1. **Always backup before migrations** (Neon does this automatically)
2. **Test migrations locally first** with a copy of production data
3. **Never edit migration files manually** after they've been applied
4. **Use descriptive migration messages** for easy tracking
5. **Keep migrations atomic** - one logical change per migration

## Migration Checklist for Production

- [ ] Test migration on local database
- [ ] Backup database (Neon auto-backup)
- [ ] Ensure no users are actively using the system
- [ ] Run migration: `python migrate_db.py`
- [ ] Verify tables/columns were created: Check Neon dashboard
- [ ] Test application functionality
- [ ] Monitor logs for errors: `vercel logs --follow`
- [ ] Rollback if issues: `alembic downgrade -1`
