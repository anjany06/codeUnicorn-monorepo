# Contributing to CodeUnicorn

First off, thank you for considering contributing to CodeUnicorn! It's people like you that make CodeUnicorn such a great tool for the community.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please open an issue in the issue tracker. Be sure to include:
- A clear and descriptive title
- Steps to reproduce the bug
- Expected behavior vs. actual behavior
- Relevant logs, screenshots, and environment details (Node version, OS, etc.)

### Suggesting Enhancements
Have an idea for a new feature? We'd love to hear it! Open an issue describing the feature, why it would be useful, and how it could be implemented. 

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. Ensure you have installed dependencies with `pnpm install` and your environment variables are configured.
3. If you've added code that should be tested, add tests.
4. Ensure the test suite passes (`pnpm test`, if configured, or ensure builds pass with `pnpm turbo build`).
5. Run linting (`pnpm turbo lint`).
6. Issue that pull request!

### Monorepo Guidelines
This project uses Turborepo. When adding features:
- Core UI components go in `packages/ui`.
- AI and Vector RAG logic goes in `packages/ai`.
- Data schema logic goes in `packages/database`.
- Make sure to update the relevant `package.json` dependencies if you import cross-packages.

## Code Review Process
All pull requests are reviewed by the maintainers. Additionally, CodeUnicorn itself might automatically review your PR (dogfooding!).
We may request changes before merging. 

Thanks again for contributing!
