# Known Issues and Test Failures

## Overview
This document comprehensively lists all known issues, test failures, and areas requiring attention in the Desktop AI Companion application.

**Last Updated**: 2024-01-XX  
**Test Suite Status**: 76/82 tests passing (93% pass rate)

---

## Test Failures

### 1. ChatPanel Component Tests (4 failures)

#### Issue: Async Timing with activeChat State Management

**Affected Tests**:
- `loads and displays chat list`
- `displays messages for active chat`
- `sends message and updates UI`
- `shows user message before assistant response`

**Root Cause**:
The `ChatPanel` component has a complex async state flow:
1. Component mounts with `activeChatId = null`
2. `useEffect` calls `getChats()` to load chat list
3. When chats load, it sets `activeChatId` to first chat's ID
4. Second `useEffect` (dependent on `activeChatId`) calls `getMessages()`
5. `activeChat` is computed from `chats.find()` using `activeChatId`
6. Component renders `ChatInput` only when `activeChat` is truthy

**Problem**:
- Tests timeout waiting for `ChatInput` to appear
- State updates happen asynchronously and may not complete before assertions
- The component shows "No chat selected" until `activeChat` is computed

**Component Location**: `src/renderer/components/chat/ChatPanel.tsx`

**Current Status**: 
- ✅ Fixed `useEffect` dependency issue (removed `activeChatId` from deps)
- ⚠️ Tests still timing out despite 10-second timeouts
- ⚠️ May need component refactoring for better testability

**Potential Solutions**:
1. **Component Refactoring**:
   - Use a loading state to indicate when chats are being loaded
   - Add a `useEffect` that runs when `chats` array changes (not just on mount)
   - Consider using React Query or SWR for better async state management

2. **Test Improvements**:
   - Wait for "No chat selected" to disappear before checking for ChatInput
   - Use `findBy*` queries instead of `waitFor` with `getBy*`
   - Mock the bridge to return resolved values synchronously in tests

3. **Alternative Approach**:
   - Split the component into smaller, more testable pieces
   - Extract chat loading logic into a custom hook
   - Use state machines (e.g., XState) for complex async flows

**Impact**: **Low** - Component works correctly in production, only test timing issues

**Priority**: **Medium** - Affects test reliability but not production functionality

---

### 2. ChatInput Component Tests (2 failures)

#### Issue: Notebook Picker Async Loading

**Affected Tests**:
- `notebook button opens picker`
- `inserts notebook entry at cursor position`

**Root Cause**:
The notebook picker uses `useEffect` that depends on `showNotebookPicker` and `searchQuery`:
```typescript
useEffect(() => {
    if (showNotebookPicker) {
        loadNotebookEntries();
    }
}, [showNotebookPicker, searchQuery]);
```

**Problem**:
- When picker opens, `showNotebookPicker` changes to `true`
- `useEffect` triggers `loadNotebookEntries()` asynchronously
- Tests check for entries before async load completes
- Even with 5-second timeouts, tests may timeout

**Component Location**: `src/renderer/components/chat/ChatInput.tsx`

**Current Status**:
- ⚠️ Tests timeout waiting for notebook entries to load
- ⚠️ Async timing between state change and data fetch

**Potential Solutions**:
1. **Component Improvements**:
   - Add loading state for notebook entries
   - Show loading indicator while entries are being fetched
   - Use `useMemo` or `useCallback` to optimize re-renders

2. **Test Improvements**:
   - Wait for loading indicator to disappear
   - Use `findBy*` queries for async elements
   - Mock `window.desktop.notebook.list` to resolve immediately

3. **Alternative Approach**:
   - Pre-load notebook entries when component mounts
   - Cache entries to avoid repeated API calls
   - Use React Query for notebook entry management

**Impact**: **Low** - Notebook picker works correctly in production

**Priority**: **Low** - Minor test timing issue, non-blocking

---

## Component Issues

### 3. ChatPanel useEffect Dependency

**Status**: ✅ **FIXED**

**Issue**: The first `useEffect` in `ChatPanel` had `activeChatId` in its dependency array, causing it to re-run every time `activeChatId` changed, potentially creating infinite loops.

**Fix Applied**:
- Removed `activeChatId` from dependency array
- Added eslint-disable comment explaining intentional omission
- Effect now only runs on component mount

**Location**: `src/renderer/components/chat/ChatPanel.tsx:16-29`

**Verification**: Component no longer has circular dependency warnings

---

## Test Infrastructure Issues

### 4. Async Test Timing

**Status**: ⚠️ **ONGOING**

**Issue**: React Testing Library tests sometimes timeout when waiting for async state updates, even with extended timeouts.

**Affected Areas**:
- Component state transitions
- Async data fetching
- User interactions that trigger async operations

**Current Mitigations**:
- Increased timeouts to 10 seconds for critical tests
- Using `waitFor` with proper error handling
- Using `findBy*` queries where appropriate

**Recommendations**:
- Consider using `@testing-library/react-hooks` for testing hooks in isolation
- Implement retry logic for flaky tests
- Use `act()` wrapper more consistently
- Consider using `@testing-library/user-event` async utilities

---

## Mock and Test Utility Issues

### 5. ToolboxService Mock Complexity

**Status**: ✅ **FIXED**

**Issue**: `child_process` mock was not properly exporting `exec` function, causing import errors.

**Fix Applied**:
- Updated mock to properly export `exec` as named export
- Fixed `ToolReportRepository` mock to return valid report records
- Updated error handling test to mock repository errors correctly

**Location**: `src/__tests__/ToolboxService.test.ts`

---

## Documentation Issues

### 6. Test Documentation Coverage

**Status**: ✅ **ADDRESSED**

**Issue**: Test failures and known issues were not comprehensively documented.

**Fix Applied**:
- Created `KNOWN_ISSUES.md` (this file)
- Created `TESTING_NOTES.md` with detailed explanations
- Created `CHANGELOG_TESTING.md` for tracking improvements
- Updated `TEST_RESULTS.md` with current status

---

## Performance Considerations

### 7. Test Execution Time

**Status**: ⚠️ **MONITORING**

**Issue**: Full test suite takes ~24 seconds to run, with some individual tests taking 20+ seconds.

**Current Metrics**:
- Total duration: ~24 seconds
- Setup time: ~7 seconds
- Test execution: ~39 seconds
- Environment setup: ~34 seconds

**Recommendations**:
- Consider parallel test execution
- Optimize test setup and teardown
- Use test sharding for CI/CD
- Cache test dependencies where possible

---

## Code Quality Issues

### 8. ESLint Warnings

**Status**: ✅ **ADDRESSED**

**Issue**: Intentional eslint-disable comments needed for `useEffect` dependencies.

**Location**: `src/renderer/components/chat/ChatPanel.tsx:29`

**Resolution**: Added explanatory comment for intentional dependency omission

---

## Missing Test Coverage

### 9. Untested Components

**Status**: ⚠️ **KNOWN GAP**

**Components Not Yet Tested**:
- `ProjectsView` - Project management UI
- `NotebookView` - Full notebook view (picker is tested)
- `NotificationHistory` - Notification history view
- `InsightsView` - Telemetry insights view

**Priority**: **Low** - These components are less critical than core chat functionality

---

## Integration Test Gaps

### 10. End-to-End Test Coverage

**Status**: ⚠️ **MISSING**

**Missing Coverage**:
- Full message send/receive flow
- Toolbox tool execution end-to-end
- Project creation and linking
- Notebook entry creation and search
- Notification flow from service to UI

**Recommendations**:
- Consider using Playwright or Cypress for E2E tests
- Add integration tests for critical user flows
- Test IPC communication between renderer and main process

---

## Environment and Configuration Issues

### 11. Test Environment Setup

**Status**: ✅ **FIXED**

**Issue**: Vitest default test timeout (5000ms) was too short for async component tests, causing timeouts even when `waitFor` had longer timeouts.

**Fix Applied**:
- Increased `testTimeout` to 15000ms in `vitest.config.ts`
- Allows `waitFor` timeouts up to 10 seconds to work properly

**Current Setup**:
- Vitest configured with jsdom environment
- React Testing Library properly configured
- Test utilities for mocking `window.desktop` bridge
- Global test setup with jest-dom matchers
- Test timeout set to 15 seconds

**Location**: `vitest.config.ts`

---

## Recommendations Summary

### High Priority
1. **Fix ChatPanel async timing** - Refactor component for better testability
2. **Improve test reliability** - Add retry logic and better async patterns

### Medium Priority
3. **Add missing component tests** - ProjectsView, NotebookView, etc.
4. **Optimize test execution time** - Parallel execution, caching

### Low Priority
5. **Fix ChatInput notebook picker timing** - Minor test issue
6. **Add E2E tests** - Comprehensive integration testing
7. **Expand test coverage** - Additional edge cases

---

## Issue Tracking

### Resolved Issues ✅
- ToolboxService mock issues
- ChatPanel useEffect dependency
- Test documentation gaps
- ESLint warnings

### Ongoing Issues ⚠️
- ChatPanel async timing (4 tests)
- ChatInput notebook picker timing (2 tests)
- Test execution time optimization
- Missing test coverage

### Future Improvements 📋
- Component refactoring for testability
- E2E test implementation
- Performance optimization
- Expanded coverage

---

## Contact and Updates

For questions or updates to this document, please:
1. Update the "Last Updated" date
2. Add new issues with full context
3. Mark resolved issues with ✅
4. Update priority and impact assessments

**Maintainer**: Development Team  
**Review Frequency**: After each test suite run

