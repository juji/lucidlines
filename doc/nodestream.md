# NodeStream API

Process management and control for running multiple commands.

<!--@include: ./.vitepress/includes/nodestream-usage.md-->

## `restartProcess(index)`

Restarts a specific process by index.

#### Parameters

- `index` (number) - Zero-based index of the process to restart

#### Returns

- `Promise<void>` - Resolves when the process has been restarted

## `restartAll()`

Restarts all processes.

#### Returns

- `Promise<void[]>` - Array of promises that resolve when all processes have been restarted

## `stop()`

Stops all processes.

#### Returns

- `Promise<void>` - Resolves when all processes have been stopped

## Types

### ProcessInfo

<!--@include: ./.vitepress/includes/process-info-interface.md-->