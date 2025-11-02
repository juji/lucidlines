# Process Management

How LucidLines manages and controls your processes.

## Process Lifecycle

### Starting Processes

When LucidLines starts, it:

1. Parses your commands from CLI or config file
2. Spawns each process using Node.js `child_process.spawn`
3. Sets up output streaming to the web interface
4. Monitors process health and exit codes

### Process Configuration

Each process is defined with a name and command:

<!--@include: ./.vitepress/includes/process-config-example.md-->

### Environment Setup

LucidLines automatically configures the environment for better output:

- `FORCE_COLOR=1` - Forces colored output
- `CLICOLOR_FORCE=1` - Forces CLI colors
- `COLORTERM=truecolor` - Enables true color support

## Process Control

### Keyboard Controls (Interactive Terminal)

When running in an interactive terminal with commands configured, you can control processes via keyboard:

- **Number Keys** (1, 2, 3...) - Restart specific process
- **r** - Restart all processes
- **ctrl+c** - Quit application

### Programmatic Control

Processes can be controlled programmatically through the API.

## Process Monitoring

### Real-time Output

- All stdout/stderr is captured and streamed
- Output is color-preserved when possible
- Large outputs are handled efficiently

### Data Storage

Process output is stored using the **DataBank** system:

- **Persistent storage** with <a href="https://github.com/Level/level" target="_blank" rel="noopener noreferrer">LevelDB</a> (pure JavaScript, no native dependencies)
- **Temporary file persistence** for data retention
- **Event-driven architecture** for real-time updates
- **Automatic cleanup** on application exit

The DataBank decouples process output from web interface consumption, allowing:

- **Buffering** of recent messages for new clients
- **Efficient querying** by process type and timestamp
- **Memory management** with configurable limits
- **Data persistence** with LevelDB reliability

### Process Health

- Exit codes are monitored
- Failed processes are logged
- Automatic restart capabilities

## Data Management

### DataBank Architecture

LucidLines uses a data management system called **DataBank**:

<!--@include: ./.vitepress/includes/log-entry-interface.md-->

### Storage Strategy

- **Primary**: LevelDB for reliable persistence (pure JavaScript, no native dependencies)
- **Temporary directory**: Auto-deleted on process exit
- **Cleanup**: Automatic removal when process exits
- **Performance**: Timestamp-based key ordering for efficient queries

### Data Flow

1. **Process Output** → Captured by NodeStream
2. **DataBank Storage** → Stored with metadata
3. **Event Emission** → Real-time updates to subscribers
4. **WebSocket Streaming** → Delivered to connected clients

### Query Capabilities

The DataBank provides rich querying for different use cases:

- **Recent Messages**: Get latest output for new clients
- **Type Filtering**: Query by specific process
- **Time-based**: Retrieve messages within time ranges
- **Pagination**: Efficient handling of large datasets

### Memory Management

- **Configurable Limits**: Default 1000 recent messages
- **Automatic Cleanup**: Triggered when process terminates
- **Resource Monitoring**: Memory usage tracking
- **Graceful Degradation**: Performance under load