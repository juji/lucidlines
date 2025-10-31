# Web Interface

LucidLines provides a modern web dashboard for monitoring and controlling your processes.

## Accessing the Dashboard

Once LucidLines is running, open your browser to:

```
http://localhost:8080
```

(or your configured port)

## Interface Overview

### Header Controls

- **Theme Toggle** - Switch between light/dark themes
- **Connection Status** - Shows WebSocket connection state
- **Process Count** - Displays number of active processes

### Terminal Area

- **Tabbed Interface** - Each process has its own tab
- **Real-time Output** - Live streaming of process output
- **Scrollable History** - Full output history with search
- **Color Preservation** - Terminal colors are maintained

### Status Indicators

- **Process Status** - Running/stopped indicators
- **Connection Status** - WebSocket connection health
- **Error Notifications** - Process failure alerts

## Features

### Real-time Updates

- Instant output streaming via WebSocket
- Live status updates
- Automatic reconnection on connection loss

### Responsive Design

- **Desktop Only** - Currently optimized for desktop browsers
- **Large Screen Recommended** - Best experience on screens 1024px and wider
- **Not Supported** - Mobile devices and small screens are not supported

### Keyboard Shortcuts

The web interface supports keyboard navigation:

- **Tab** - Switch between process tabs
- **Arrow Keys** - Navigate within terminal output
- **Ctrl+F** - Search in terminal output

## Customization

### Themes

LucidLines supports multiple themes:

- **Light Theme** - Clean, bright interface
- **Dark Theme** - Easy on the eyes for long sessions
- **Auto Theme** - Follows system preference

### Layout Options

- **Compact Mode** - More processes visible
- **Expanded Mode** - Larger terminal areas
- **Split View** - Side-by-side process comparison

## Browser Support

LucidLines works in modern desktop browsers:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

**Mobile browsers are not supported.** Use a desktop browser for the best experience.

## Troubleshooting

### Connection Issues

If the dashboard doesn't load:

1. Check that LucidLines is running
2. Verify the correct port number
3. Check browser console for errors
4. Ensure WebSocket connections are allowed

### Performance Issues

For better performance with many processes:

1. Use the compact layout
2. Limit output history size
3. Close unused tabs
4. Use a modern browser

### Mobile Issues

**Small screens are not supported.** 

LucidLines is designed for desktop development environments. For the best experience:

- Use a desktop or laptop computer
- Ensure screen width is at least 1024px
- Use a modern desktop browser

Mobile browsers are not supported due to the complex terminal interface requirements.