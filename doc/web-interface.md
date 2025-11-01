# Web Interface

LucidLines provides a modern web dashboard for monitoring and controlling your processes.

## Accessing the Dashboard

Once LucidLines is running, open your browser to:

```
http://localhost:8080
```

(or your configured port)

# Web Interface

LucidLines provides a modern web dashboard for monitoring and controlling your processes in real-time.

## Accessing the Dashboard

Once LucidLines is running, open your browser and navigate to:

```
http://localhost:8080
```

(or your configured port)

## Interface Overview

### Basic Terminal Display
The web interface displays your configured processes in individual terminal windows, showing real-time output as it streams from each process.

<p style="text-align: center;">
  <img src="/basic.gif" alt="LucidLines Web Interface Basics" style="display: block; margin: 0 auto;">
</p>

### Terminal Selection
You can toggle individual terminals on and off without affecting the underlying processes. This allows you to focus on specific outputs while keeping processes running in the background.

<p style="text-align: center;">
  <img src="/select.gif" alt="LucidLines Web Interface Selection" style="display: block; margin: 0 auto;">
</p>

### Interface Customization
The dashboard offers several customization options:
- **Text Size**: Adjust the font size for better readability
- **Color Customization**: Apply HSL color schemes to all terminal outputs

<p style="text-align: center;">
  <img src="/option.gif" alt="LucidLines Web Interface Options" style="display: block; margin: 0 auto;">
</p>

### Terminal Reordering
Terminals can be rearranged using drag-and-drop functionality, allowing you to organize your workspace according to your preferences.

<p style="text-align: center;">
  <img src="/dnd.gif" alt="LucidLines Web Interface Drag and Drop" style="display: block; margin: 0 auto;">
</p>



## Browser Support

LucidLines works in modern desktop browsers:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

**Mobile browsers are not supported.** Use a desktop browser for the best experience.

## Troubleshooting

### Connection Issues

If the dashboard fails to load:

1. Verify that LucidLines is running and accessible
2. Confirm you're using the correct port number
3. Check the browser's developer console for error messages
4. Ensure WebSocket connections are permitted by your network/firewall

### Performance Issues

For optimal performance with multiple processes:

1. Switch to the compact layout when monitoring many terminals
2. Reduce the output history buffer size
3. Close unused terminal tabs
4. Use a modern, up-to-date browser

### Mobile Device Limitations

**Mobile browsers are not supported.**

LucidLines is designed specifically for desktop development environments. For the best experience:

- Use a desktop or laptop computer
- Ensure your screen width is at least 1024px
- Use a modern desktop browser

The complex terminal interface requirements make mobile browser support impractical.