# DataBank API

Central data storage system that decouples data producers from consumers.

```typescript
import { start } from 'lucidlines';

const { databank } = start({
  commands: [
    { name: 'web', command: 'npm run dev' }
  ]
});

// see databank methods below
```

::: warning
Data storage is typically handled automatically by LucidLines, when `serverPort` option is used. The DataBank API is primarily intended for advanced users who need direct access to the data layer. Most users won't need to interact with DataBank directly.
:::

## `addData(type, data)`

Adds data to the DataBank storage. This is done internally by the internal library `node-stream.ts`. Users typically don't use this.

#### Parameters

- `type` (string) - Data type/category
- `data` (string) - The data content to store

#### Example

```typescript
/* with:
commands: [
  { name: 'web', command: 'npm run dev' }
]
*/
databank.addData('web', 'log message');
```

## `getRecentMessages(limit?)`

Gets recent messages for newly connected clients.

#### Parameters

- `limit` (number, optional) - Maximum number of messages to return (default: 1000)

#### Returns

- `LogEntry[]` - Array of recent log entries

#### Example

```typescript
const recent = databank.getRecentMessages(50);
```

## `getMessageByType(type, lastTimestamp?, limit?)`

Gets messages for a specific type.

#### Parameters

- `type` (string) - Data type to filter by
- `lastTimestamp` (number, optional) - Get messages before this timestamp
- `limit` (number, optional) - Maximum number of messages to return (default: 20)

#### Returns

- `LogEntry[]` - Array of log entries for the specified type

#### Example

```typescript
/* with:
commands: [
  { name: 'web', command: 'npm run dev' }
]
*/
const appLogs = databank.getMessageByType('web', undefined, 100);
```

## `getAllMessages()`

Gets all stored messages (use with caution for large datasets).

#### Returns

- `LogEntry[]` - Array of all log entries

#### Example

```typescript
const allMessages = databank.getAllMessages();
```

## `getTotalMessageCount()`

Gets the total count of all stored messages.

#### Returns

- `number` - Total message count

#### Example

```typescript
const total = databank.getTotalMessageCount();
```

## `getMessageCountByType(type)`

Gets the count of messages for a specific type.

#### Parameters

- `type` (string) - Data type to count

#### Returns

- `number` - Message count for the specified type

#### Example

```typescript
/* with:
commands: [
  { name: 'web', command: 'npm run dev' }
]
*/
const appCount = databank.getMessageCountByType('web');
```

## `getAvailableTypes()`

Gets all unique data types stored.

#### Returns

- `string[]` - Array of available data types

#### Example

```typescript
const types = databank.getAvailableTypes();
```

## `subscribe(callback)`

Subscribes to real-time data updates.

#### Parameters

- `callback` (function) - Function called when new data arrives

#### Returns

- `function` - Unsubscribe function

#### Example

```typescript
const unsubscribe = databank.subscribe((entry: LogEntry) => {
  console.log(`${entry.type}: ${entry.data}`);
});

// Later...
unsubscribe();
```

## `cleanup()`

Cleans up DataBank resources (should be called on shutdown).

#### Example

```typescript
databank.cleanup();
```

## Types

### LogEntry

```typescript
interface LogEntry {
  type: string;      // Data type/category
  data: string;      // The actual data content
  timestamp: number; // Unix timestamp
}
```