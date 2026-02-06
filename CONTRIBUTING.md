# Contributing to Elasticsearch DSL Libraries

Thank you for your interest in contributing!

## Development Setup

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/elastic/elasticsearch-dsl-js.git
cd elasticsearch-dsl-js
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the tests:

```bash
pnpm test
```

## Development Workflow

### Available Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `pnpm run build`        | Build all packages                       |
| `pnpm run test`         | Run tests for all packages               |
| `pnpm run test:watch`   | Run tests in watch mode                  |
| `pnpm run test:coverage`| Run tests with coverage                  |
| `pnpm run lint`         | Check for linting errors                 |
| `pnpm run lint:fix`     | Fix linting errors                       |
| `pnpm run typecheck`    | Check TypeScript types                   |
| `pnpm run ci`           | Run full CI pipeline                     |

### Working with Individual Packages

```bash
# Build a specific package
pnpm --filter @elastic/elasticsearch-query-builder build

# Test a specific package
pnpm --filter @elastic/elasticsearch-esql-dsl test
```

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The configuration enforces:

- 2-space indentation
- Single quotes
- No semicolons (except where required)
- Trailing commas in ES5 contexts
- 100-character line width

Run `npm run lint:fix` to automatically fix formatting issues.

### Testing

We use [Vitest](https://vitest.dev/) for testing. Tests are located in the `test/` directory.

- Write tests for all new features
- Ensure existing tests pass before submitting a PR
- Aim for high code coverage

### TypeScript

- Enable strict mode
- Add types for all public APIs
- Export types from `src/types.ts`

## Pull Request Process

1. **Fork** the repository and create your branch from `main`
2. **Make your changes** following the code style guidelines
3. **Add tests** for any new functionality
4. **Update documentation** if needed
5. **Run all checks**: `npm run ci`
6. **Submit a pull request** with a clear description of the changes

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add multi_match query support`
- `fix: correct range query date handling`
- `docs: update README with new examples`
- `test: add tests for bool query`
- `chore: update dependencies`

### SPDX License Headers

All source files must include the SPDX license header:

```typescript
/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */
```

## Reporting Issues

- Use the [issue templates](https://github.com/elastic/elasticsearch-dsl-js/issues/new/choose)
- Include a minimal reproducible example
- Provide version information (Node.js, library version)

## Code of Conduct

This project follows the [Elastic Community Code of Conduct](https://www.elastic.co/community/codeofconduct).

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.
