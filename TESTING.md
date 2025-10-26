# Testing Guide

This project uses **Vitest** with **React Testing Library** for unit and integration testing.

## Overview

The test suite covers:
- ✅ Component rendering and behavior
- ✅ React hooks (custom and built-in)
- ✅ Server-side tRPC routers
- ✅ Configuration and utility modules
- ✅ User interactions and event handling
- ✅ Edge cases and error conditions

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Quick Start

After installation, you can run tests immediately:

```bash
npm install
npm test
```

## Test Structure

Tests are co-located with source files in `__tests__` directories.

## Best Practices

1. Test behavior, not implementation
2. Use descriptive test names
3. Follow AAA pattern (Arrange, Act, Assert)
4. Test edge cases and error conditions
5. Use semantic queries over test IDs

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

See TEST_SUMMARY.md for complete test coverage details.