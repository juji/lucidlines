```bash
# Multiple services
lucidlines \
  -c "web:npm run dev" \
  -c "api:python -m flask run" \
  -c "db:docker run -p 5432:5432 postgres" \
  -c "redis:redis-server"

# Development with custom port
lucidlines -p 3001 --dev -c "app:npm run dev"
```