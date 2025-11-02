/**
 * Server Log Simulator
 * Generates realistic server logs with different severity levels in color
 */

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  // Foreground colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  
  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  bgGray: "\x1b[100m",
};

// Log levels with their colors
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  NOTICE = "NOTICE",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
  ALERT = "ALERT",
  EMERGENCY = "EMERGENCY"
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: Record<string, any>;
  requestId?: string;
}

class ServerLogSimulator {
  private services: string[] = [
    "api-gateway", 
    "auth-service", 
    "user-service", 
    "payment-processor", 
    "notification-service", 
    "database", 
    "cache-service", 
    "file-service",
    "search-service",
    "recommendation-engine"
  ];
  
  private ipAddresses: string[] = [
    "192.168.1.24",
    "172.16.45.132",
    "10.0.12.78",
    "172.31.128.54",
    "192.168.0.112",
    "10.10.5.23",
    "172.20.44.10"
  ];
  
  private endpoints: string[] = [
    "/api/v1/users",
    "/api/v1/auth/login",
    "/api/v1/products",
    "/api/v1/payments/process",
    "/api/v1/orders",
    "/api/v1/search",
    "/api/v1/notifications",
    "/api/v1/files/upload",
    "/api/v1/recommendations",
    "/health",
    "/metrics"
  ];
  
  private debugMessages: string[] = [
    "Received request from {ip}",
    "Processing request {requestId}",
    "Query params: {data}",
    "Cache hit for key {key}",
    "Cache miss for key {key}",
    "Starting background job {jobId}",
    "Loaded configuration from environment"
  ];
  
  private infoMessages: string[] = [
    "Request completed in {time}ms",
    "User {userId} logged in successfully",
    "Successfully processed payment {paymentId}",
    "Database connection established",
    "Worker process started with pid {pid}",
    "Scheduled task {taskName} started",
    "API request to {endpoint} completed successfully"
  ];
  
  private warningMessages: string[] = [
    "Slow database query detected ({time}ms): {query}",
    "Rate limit threshold approaching for IP {ip}",
    "High memory usage detected: {memoryUsage}%",
    "JWT token near expiration for user {userId}",
    "Retry attempt {attempt} for {operation}",
    "Deprecated API endpoint accessed: {endpoint}",
    "Request queue size growing: {queueSize} items"
  ];
  
  private errorMessages: string[] = [
    "Database query failed: {errorMessage}",
    "Failed to connect to service {serviceName}",
    "API request to {endpoint} failed with status {statusCode}",
    "Validation error: {errorMessage}",
    "Authentication failed for user {userId}",
    "Payment processing error: {errorMessage}",
    "File upload failed: {errorMessage}"
  ];
  
  private criticalMessages: string[] = [
    "Database connection pool exhausted",
    "Out of memory error in {service}",
    "System disk space critically low: {diskSpace}%",
    "API rate limit exceeded, blocking requests",
    "Security breach detected from IP {ip}",
    "Fatal error in main process: {errorMessage}",
    "Data corruption detected in {dataStore}"
  ];
  
  constructor(private intervalMs: number = 1000) {}
  
  /**
   * Start generating server logs
   */
  public start(): void {
    console.log(`${colors.cyan}${colors.bright}Server log simulator started${colors.reset}\n`);
    
    // Initial log
    this.generateLog();
    
    // Set interval for regular logs
    setInterval(() => {
      this.generateLog();
    }, this.intervalMs);
  }
  
  /**
   * Generate and display a random log entry
   */
  private generateLog(): void {
    const randomLogLevel = this.getRandomLogLevel();
    const service = this.getRandomItem(this.services);
    const requestId = this.generateRequestId();
    
    // Create the log entry
    const logEntry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: randomLogLevel,
      service,
      message: this.getMessageForLevel(randomLogLevel),
      requestId
    };
    
    // Add additional data based on log level
    logEntry.data = this.generateRandomData(randomLogLevel);
    
    // Display the formatted log
    this.displayLog(logEntry);
  }
  
  /**
   * Get a random log level with weighted distribution
   * (more common levels appear more frequently)
   */
  private getRandomLogLevel(): LogLevel {
    const rand = Math.random() * 100;
    
    if (rand < 30) return LogLevel.INFO;
    if (rand < 55) return LogLevel.DEBUG;
    if (rand < 70) return LogLevel.NOTICE;
    if (rand < 85) return LogLevel.WARNING;
    if (rand < 95) return LogLevel.ERROR;
    if (rand < 98) return LogLevel.CRITICAL;
    if (rand < 99.5) return LogLevel.ALERT;
    return LogLevel.EMERGENCY;
  }
  
  /**
   * Get a random message appropriate for the log level
   */
  private getMessageForLevel(level: LogLevel): string {
    let messages: string[];
    
    switch (level) {
      case LogLevel.DEBUG:
        messages = this.debugMessages;
        break;
      case LogLevel.INFO:
      case LogLevel.NOTICE:
        messages = this.infoMessages;
        break;
      case LogLevel.WARNING:
        messages = this.warningMessages;
        break;
      case LogLevel.ERROR:
        messages = this.errorMessages;
        break;
      default:
        messages = this.criticalMessages;
    }
    
    return this.getRandomItem(messages);
  }
  
  /**
   * Generate random data to fill in message placeholders
   */
  private generateRandomData(level: LogLevel): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Common fields
    data.ip = this.getRandomItem(this.ipAddresses);
    data.endpoint = this.getRandomItem(this.endpoints);
    data.userId = `user_${Math.floor(Math.random() * 10000)}`;
    data.time = Math.floor(Math.random() * 1000);
    
    // Specific fields based on level
    if (level === LogLevel.DEBUG || level === LogLevel.INFO) {
      data.key = `cache:${data.userId}:preferences`;
      data.pid = Math.floor(Math.random() * 50000);
      data.taskName = this.getRandomItem([
        "email-digest", "analytics-rollup", "cleanup", "index-rebuild"
      ]);
    } else if (level === LogLevel.WARNING) {
      data.memoryUsage = 80 + Math.floor(Math.random() * 15);
      data.queueSize = Math.floor(Math.random() * 500);
      data.attempt = 1 + Math.floor(Math.random() * 3);
      data.operation = this.getRandomItem([
        "payment-processing", "file-upload", "email-sending"
      ]);
      data.query = "SELECT * FROM users WHERE last_login > ? LIMIT 1000";
    } else {
      data.statusCode = this.getRandomItem([400, 403, 404, 422, 429, 500, 503]);
      data.errorMessage = this.getRandomItem([
        "Connection refused", 
        "Timeout exceeded",
        "Invalid input",
        "Resource not found",
        "Insufficient permissions",
        "Internal server error"
      ]);
      data.diskSpace = Math.floor(Math.random() * 5);
      data.dataStore = this.getRandomItem([
        "user-database", "file-storage", "cache-cluster", "config-store"
      ]);
    }
    
    return data;
  }
  
  /**
   * Format and display a log entry with appropriate colors
   */
  private displayLog(log: LogEntry): void {
    // Choose color based on log level
    let levelColor: string;
    let levelDisplay: string;
    
    switch (log.level) {
      case LogLevel.DEBUG:
        levelColor = colors.gray;
        levelDisplay = log.level;
        break;
      case LogLevel.INFO:
        levelColor = colors.green;
        levelDisplay = log.level;
        break;
      case LogLevel.NOTICE:
        levelColor = colors.cyan;
        levelDisplay = log.level;
        break;
      case LogLevel.WARNING:
        levelColor = colors.yellow;
        levelDisplay = log.level;
        break;
      case LogLevel.ERROR:
        levelColor = colors.red;
        levelDisplay = log.level;
        break;
      case LogLevel.CRITICAL:
        levelColor = `${colors.bgRed}${colors.white}`;
        levelDisplay = log.level;
        break;
      case LogLevel.ALERT:
      case LogLevel.EMERGENCY:
        levelColor = `${colors.bgRed}${colors.bright}${colors.white}`;
        levelDisplay = log.level;
        break;
    }
    
    // Format timestamp in cyan
    const timestamp = `${colors.cyan}${log.timestamp}${colors.reset}`;
    
    // Format level with appropriate color
    const level = `${levelColor}${levelDisplay.padEnd(9)}${colors.reset}`;
    
    // Format service name in magenta
    const service = `${colors.magenta}${log.service.padEnd(18)}${colors.reset}`;
    
    // Format request ID in dim gray
    const requestId = log.requestId ? 
      `${colors.gray}[${log.requestId}]${colors.reset} ` : '';
    
    // Format and interpolate message
    let message = log.message;
    if (log.data) {
      // Replace placeholders in the message with actual data
      Object.entries(log.data).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, value);
      });
    }
    
    // Highlight certain patterns in the message
    message = message
      .replace(/error|fail|exception/gi, match => `${colors.red}${match}${colors.reset}`)
      .replace(/success|successful/gi, match => `${colors.green}${match}${colors.reset}`);
    
    // Assemble the final log line
    console.log(`${timestamp} ${level} ${service} ${requestId}${message}`);
    
    // For critical errors, add a stack trace
    if (log.level === LogLevel.CRITICAL || log.level === LogLevel.EMERGENCY || log.level === LogLevel.ALERT) {
      console.log(`${colors.gray}  └─ ${this.generateFakeStackTrace()}${colors.reset}\n`);
    }
  }
  
  /**
   * Generate a fake stack trace for critical errors
   */
  private generateFakeStackTrace(): string {
    const traces = [
      "at processTicksAndRejections (node:internal/process/task_queues:95:5)",
      "at async Promise.all (index 0)",
      "at async fetchData (/src/services/dataService.js:127:12)",
      "at async processRequest (/src/controllers/apiController.js:45:23)",
      "at async handleRequest (/src/middleware/requestHandler.js:67:10)",
      "at async Server.<anonymous> (/src/server.js:98:7)"
    ];
    
    // Return 2-4 random trace lines
    const count = 2 + Math.floor(Math.random() * 3);
    return traces.slice(0, count).join("\n  └─ ");
  }
  
  /**
   * Get formatted current timestamp
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }
  
  /**
   * Generate a random request ID
   */
  private generateRequestId(): string {
    const hex = '0123456789abcdef';
    let id = '';
    for (let i = 0; i < 16; i++) {
      id += hex[Math.floor(Math.random() * 16)];
    }
    return id;
  }
  
  /**
   * Get a random item from an array
   */
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

// Create and start the log simulator with logs every 500 milliseconds
const logSimulator = new ServerLogSimulator(500);
logSimulator.start();