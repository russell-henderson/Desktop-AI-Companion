# Testing Directory

This directory contains all testing-related files for the Desktop AI Companion application.

## Structure

```
testing/
├── __tests__/          # All test files
│   ├── renderer/      # React component tests
│   ├── ipc/           # IPC handler tests
│   ├── setup.ts       # Global test setup
│   └── test-utils.tsx # Test utilities and helpers
├── docs/              # Testing documentation
└── vitest.config.ts   # Vitest configuration
```

## Running Tests

From the project root:

```bash
npm test              # Run all tests
npm run test:ui       # Run tests with UI
```

## Test Files

- **Service Tests**: AIService, ToolboxService, MonitoringService, DashboardService
- **IPC Tests**: ai:sendMessage handler
- **Component Tests**: All React components in `renderer/` directory

## Documentation

See `docs/` directory for:
- Test results and status
- Known issues and resolutions
- Testing strategies and patterns
- Implementation details

## Configuration

The `vitest.config.ts` file is configured to:
- Use jsdom environment for React component tests
- Set up global test utilities
- Configure path aliases for imports
- Set test timeout to 15 seconds

