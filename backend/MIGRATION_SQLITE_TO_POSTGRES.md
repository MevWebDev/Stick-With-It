# Migration Guide: SQLite to PostgreSQL

This guide walks you through migrating the Django backend from SQLite to PostgreSQL with Redis caching.

## Prerequisites

- Docker and Docker Compose installed
- Existing Django project running with SQLite
- Basic knowledge of terminal commands

## Step 1: Backup Current SQLite Data

Before making any changes, export your existing data:

```bash
# Start your current containers if not running
docker-compose up -d

# Export all data to JSON backup
docker-compose exec web python manage.py dumpdata \
  --natural-foreign \
  --natural-primary \
  --exclude contenttypes \
  --exclude auth.permission \
  --indent 2 > data/backup.json

# Create a backup copy of the SQLite database
cp data/db.sqlite3 data/db.sqlite3.backup
```

Verify the backup was created:
```bash
ls -lh data/backup.json data/db.sqlite3.backup
```

## Step 2: Update Dependencies

Add PostgreSQL and Redis dependencies to `requirements.txt`:

```txt
# Add these lines to requirements.txt
psycopg2-binary>=2.9.9
redis>=5.0.1
django-redis>=5.4.0
```

## Step 3: Update Docker Compose Configuration

Replace your `docker-compose.yml` with the following configuration:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: postgres-db
    environment:
      - POSTGRES_DB=habittracker
      - POSTGRES_USER=habituser
      - POSTGRES_PASSWORD=habitpass123
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U habituser -d habittracker"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: redis-cache
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  web:
    build: .
    container_name: django-backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    environment:
      - DJANGO_SECRET_KEY=your-secret-key-here
      - DJANGO_DEBUG=True
      - ALLOWED_HOSTS=localhost,127.0.0.1
      - DB_ENGINE=postgresql
      - DB_NAME=habittracker
      - DB_USER=habituser
      - DB_PASSWORD=habitpass123
      - DB_HOST=db
      - DB_PORT=5432
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
  backup-storage:
```

## Step 4: Update Django Settings

Modify `backend/settings.py` to support environment-based configuration:

### Add imports at the top:
```python
import os
from pathlib import Path
from datetime import timedelta
```

### Update SECRET_KEY, DEBUG, and ALLOWED_HOSTS:
```python
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-fallback-key')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
```

### Update DATABASES configuration:
```python
# Configure database based on environment variables
DB_ENGINE = os.environ.get('DB_ENGINE', 'sqlite3')

if DB_ENGINE == 'postgresql':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'habittracker'),
            'USER': os.environ.get('DB_USER', 'habituser'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'habitpass123'),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': 600,
        }
    }
else:
    # Default to SQLite for development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'data' / 'db.sqlite3',
        }
    }
```

### Update CACHES configuration:
```python
# Cache Configuration
REDIS_URL = os.environ.get('REDIS_URL')

if REDIS_URL:
    # Use Redis for caching when available
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }
else:
    # Fallback to local memory cache for development
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'unique-snowflake',
        }
    }
```

### Update FRONTEND_URL:
```python
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
```

## Step 5: Handle Model Field Length Issues (if needed)

If you have any models with CharField limits that might be too short, update them. For example, in `accounts/models.py`:

```python
class Challenge(models.Model):
    title = models.CharField(max_length=50)  # Increased from 20
    category = models.CharField(max_length=50)  # Increased from 20
    description = models.CharField(max_length=200)
    difficulty = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(3)])
```

## Step 6: Stop Current Containers

```bash
docker-compose down
```

## Step 7: Rebuild Docker Images

```bash
docker-compose build --no-cache
```

This will install the new PostgreSQL and Redis dependencies.

## Step 8: Start New Services

```bash
docker-compose up -d
```

Wait for all services to be healthy. Check status with:
```bash
docker-compose ps
```

## Step 9: Run Migrations

```bash
docker-compose exec web python manage.py migrate
```

## Step 10: Fix Column Lengths (if you modified models)

If you increased CharField lengths, update the PostgreSQL schema:

```bash
docker-compose exec db psql -U habituser -d habittracker -c \
  "ALTER TABLE accounts_challenge ALTER COLUMN title TYPE VARCHAR(50); \
   ALTER TABLE accounts_challenge ALTER COLUMN category TYPE VARCHAR(50);"
```

Adjust table/column names based on your models.

## Step 11: Load Backup Data

```bash
docker-compose exec web python manage.py loaddata data/backup.json
```

You should see output like:
```
Installed 146 object(s) from 1 fixture(s)
```

## Step 12: Verify Data Migration

Check that all data was migrated correctly:

```bash
docker-compose exec db psql -U habituser -d habittracker -c \
  "SELECT 'challenges' as table_name, COUNT(*) FROM accounts_challenge 
   UNION ALL SELECT 'users', COUNT(*) FROM auth_user 
   UNION ALL SELECT 'userstats', COUNT(*) FROM accounts_userstats 
   UNION ALL SELECT 'habits', COUNT(*) FROM habits_habit;"
```

## Step 13: Test Redis Cache

```bash
docker-compose exec web python manage.py shell -c \
  "from django.core.cache import cache; \
   cache.set('test', 'redis_works', 30); \
   print('Redis test:', cache.get('test'))"
```

Expected output: `Redis test: redis_works`

## Step 14: Run Test Suite

```bash
docker-compose exec web python -m pytest --cov
```

Or use Django's test runner:
```bash
docker-compose exec web python manage.py test
```

## Step 15: Verify Application

1. Open your browser to `http://localhost:8000/admin`
2. Log in with your existing admin credentials
3. Verify all data is present
4. Test API endpoints

## Step 16: Cleanup (Optional)

Once you've verified everything works:

```bash
# Remove SQLite database (keep backup)
rm data/db.sqlite3

# Keep the JSON backup for safety
# data/backup.json
# data/db.sqlite3.backup
```

## Troubleshooting

### Container won't start
```bash
docker-compose logs web
docker-compose logs db
```

### Data loading fails
- Check that migrations ran successfully
- Verify PostgreSQL is healthy: `docker-compose exec db pg_isready -U habituser`
- Check if tables exist: `docker-compose exec db psql -U habituser -d habittracker -c "\dt"`

### Redis connection issues
```bash
docker-compose exec redis redis-cli ping
```
Should return `PONG`

### Reset and try again
```bash
docker-compose down -v  # WARNING: Deletes all volumes
docker-compose up -d
# Start from Step 9
```

## Production Considerations

For production deployment:

1. **Change default passwords** in docker-compose.yml
2. **Use environment files** instead of hardcoded values
3. **Enable PostgreSQL backups** (pg_dump scheduled via cron)
4. **Configure SSL/TLS** for PostgreSQL connections
5. **Use managed database services** (AWS RDS, Railway PostgreSQL, etc.)
6. **Set DEBUG=False** in production
7. **Configure proper ALLOWED_HOSTS**
8. **Use Redis for session storage** in addition to caching

## Database Connection Strings

### Local Docker:
```
postgresql://habituser:habitpass123@localhost:5432/habittracker
redis://localhost:6379/0
```

### Railway (auto-provided):
```
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://default:pass@host:port
```

## Next Steps

- Set up automated PostgreSQL backups
- Configure connection pooling (pgBouncer)
- Monitor database performance
- Optimize queries with database indexes
- Consider read replicas for scaling

---

**Note:** This migration guide is specific to the habit tracker project but can be adapted for other Django projects. Always test in a development environment first!
