# Contributing to Aggrada

Thank you for considering contributing to Aggrada! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct. Please be respectful and considerate of others.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion for improvement:

1. Check if the issue already exists in the [GitHub Issues](https://github.com/username/aggrada/issues)
2. If not, create a new issue with a clear description, including:
   - Steps to reproduce (for bugs)
   - Expected behavior
   - Actual behavior
   - Screenshots or code examples if applicable
   - Your environment (OS, Python version, etc.)

### Submitting Changes

1. Fork the repository
2. Create a new branch for your feature or bugfix (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Update documentation if necessary
7. Commit your changes with clear commit messages
8. Push to your fork
9. Submit a pull request

### Pull Request Process

1. Update the README.md or documentation with details of changes if appropriate
2. Update the tests to cover your changes
3. The PR should work on the main development branch
4. Include a description of what your changes do and why they should be included

## Development Setup

1. Clone the repository
2. Install development dependencies:
   ```bash
   pip install -e ".[dev]"
   ```
3. Run tests to ensure everything is working:
   ```bash
   pytest
   ```

## Testing

We use pytest for testing. To run tests:

```bash
pytest
```

To run tests with coverage:

```bash
pytest --cov=aggrada
```

## Code Style

We follow PEP 8 style guidelines for Python code. Please ensure your code adheres to these standards.

We use black for code formatting:

```bash
black aggrada tests
```

And flake8 for linting:

```bash
flake8 aggrada tests
```

## Documentation

We use Sphinx for documentation. To build the documentation:

```bash
cd docs
make html
```

## Questions?

If you have any questions, feel free to open an issue or contact the maintainers.
