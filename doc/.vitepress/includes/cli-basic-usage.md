```bash
# Start with two processes
lucidlines -c "frontend:npm run dev" -c "backend:npm run server"

# Use custom port
lucidlines -p 3000 -c "app:npm start"

# Development mode
lucidlines --dev -c "web:npm run dev" -c "logs:tail -f app.log"

# Multiple services
lucidlines \
  -c "web:npm run dev" \
  -c "api:python -m flask run" \
  -c "db:docker run -p 5432:5432 postgres" \
  -c "redis:redis-server"

# Using other configuration file
lucidlines -C my-config.json5
```
