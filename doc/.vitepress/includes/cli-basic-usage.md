```bash
# Start with two processes
lucidlines -c "frontend:npm run dev" -c "backend:npm run server"

# Use custom port
lucidlines -p 3000 -c "app:npm start"

# Development mode
lucidlines --dev -c "web:npm run dev" -c "logs:tail -f app.log"

# Use configuration file
lucidlines -C my-config.json5
```