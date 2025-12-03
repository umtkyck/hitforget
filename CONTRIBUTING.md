# Contributing to Visucan

Thank you for your interest in contributing to Visucan! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/umtkyck/visucan/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (browser, OS, device)

### Suggesting Features

1. Check if the feature has been requested
2. Create a new issue with:
   - Clear use case
   - Expected behavior
   - Mockups or examples (if applicable)
   - Why this feature would be valuable

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Setup

See [README.md](README.md) for detailed setup instructions.

Quick start:
```bash
# Clone the repo
git clone https://github.com/umtkyck/visucan.git
cd visucan

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for new code
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Prefer functional components (React)

### Commits
- Use clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused and atomic

Example:
```
feat: add serial console component (#123)

- Implement Xterm.js integration
- Add WebSocket connection
- Handle reconnection logic
```

### Testing
- Write tests for new features
- Maintain >70% code coverage
- Test edge cases
- Include integration tests for critical paths

## Project Structure

```
visucan/
├── app/              # Next.js app (routes, pages)
├── components/       # React components
├── lib/             # Utilities, database, helpers
├── device-backend/  # Device management backend
├── public/          # Static assets
├── scripts/         # Deployment and setup scripts
└── docs/            # Documentation
```

## Questions?

Feel free to ask questions by:
- Opening an issue
- Joining our Discord
- Emailing support@visucan.io

Thank you for contributing! 🎉
