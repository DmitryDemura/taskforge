# Unified Linting and Formatting Configuration

This project uses a unified configuration system for ESLint and Prettier, which
works across the entire monorepo (frontend, backend, scripts).

## Configuration Structure

### Core Files

- **`eslint.config.mjs`** - ESLint configuration for the entire project
- **`.prettierrc.json`** - Prettier configuration with support for various file
  types
- **`.prettierignore`** - Files ignored by Prettier
- **`lint.config.mjs`** - Unified configurator with CLI interface
- **`.lintstagedrc.cjs`** - Configuration for pre-commit hooks

### Supported Files

- **JavaScript/TypeScript**: `.js`, `.mjs`, `.cjs`, `.ts`, `.cts`, `.mts`,
  `.tsx`
- **Vue**: `.vue` (frontend)
- **Styles**: `.css`, `.scss`
- **Data**: `.json`, `.yml`, `.yaml`
- **Documentation**: `.md`

## Commands

### Basic Commands

```bash
# Check entire project (linting + formatting)
npm run lint

# Fix all issues in the project
npm run lint:fix

# Formatting only
npm run format

# Check formatting (without fixes)
npm run format:check
```

### Commands for Individual Project Parts

```bash
# Backend
npm run lint:backend          # Check backend
npm run lint:fix:backend      # Fix backend
npm run format:backend        # Format backend

# Frontend
npm run lint:frontend         # Check frontend
npm run lint:fix:frontend     # Fix frontend
npm run format:frontend       # Format frontend

# Scripts
npm run lint:scripts          # Check scripts
npm run lint:fix:scripts      # Fix scripts

# Documentation
npm run format:docs           # Format documentation
```

### Direct Usage of lint.config.mjs

```bash
# General commands
node lint.config.mjs fix                    # Fix all
node lint.config.mjs check                  # Check all
node lint.config.mjs lint "backend/**/*.ts" # Lint specific files
node lint.config.mjs format "**/*.md"       # Format specific files

# Predefined commands
node lint.config.mjs fixAll
node lint.config.mjs fixBackend
node lint.config.mjs fixFrontend
node lint.config.mjs checkAll
node lint.config.mjs formatDocs
```

## ESLint Configuration

### Configuration Features

- **Unified configuration** for the entire monorepo
- **Prettier integration** via `eslint-plugin-prettier`
- **Specific rules** for frontend (Nuxt 3) and backend (NestJS)
- **TypeScript support** with project settings
- **Ignoring** build files and dependencies

### Default Rules

- Mandatory curly braces (`curly`)
- Empty lines before `if`, `return`, `function`
- Warnings for unused variables
- Prettier integration for formatting

### Specific Rules

**Frontend (Nuxt 3):**

- `console.log` allowed for debugging
- Nuxt 3 global variables (`$fetch`, `useRoute`, etc.)
- Browser globals support

**Backend (NestJS):**

- Strict TypeScript rules
- `require()` imports forbidden
- `console.log` warnings
- Node.js globals support

**Scripts:**

- `require()` imports allowed
- `console.log` allowed
- CommonJS support

## Prettier Configuration

### Basic Settings

```json
{
  "semi": true, // Semicolons
  "singleQuote": true, // Single quotes
  "trailingComma": "all", // Trailing commas
  "printWidth": 100, // Maximum line width
  "tabWidth": 2, // Indentation size
  "arrowParens": "always", // Parentheses for arrow functions
  "endOfLine": "lf" // Unix line endings
}
```

### Overrides for Different File Types

- **Markdown**: 80 character width, line wrapping
- **JSON**: 120 character width
- **Vue**: double quotes for compatibility

## Pre-commit Hooks

Automatic checks configured on commit via `lint-staged`:

- **Frontend files**: Prettier → ESLint
- **Backend files**: Prettier → ESLint
- **Scripts**: Prettier → ESLint
- **Configuration files**: Prettier only
- **Documentation and data**: Prettier only

## IDE Integration

### VS Code

Recommended extensions:

- ESLint
- Prettier - Code formatter

Settings in `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript", "vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### WebStorm/IntelliJ

1. Enable ESLint in settings
2. Enable Prettier in settings
3. Configure auto-formatting on save

## Troubleshooting

### Conflicts Between ESLint and Prettier

`eslint-config-prettier` is used to disable conflicting ESLint rules.

### TypeScript Issues

Make sure that:

- `tsconfig.json` files are correct
- Project paths are specified correctly in `eslint.config.mjs`

### File Ignoring Issues

Check:

- `.prettierignore` for Prettier
- `ignores` section in `eslint.config.mjs` for ESLint

### Slow Performance

To speed up, you can:

- Use commands for specific project parts
- Add more files to ignore lists
- Use ESLint cache: `--cache` flag

## Adding New Rules

### ESLint Rules

Edit `eslint.config.mjs`, adding rules to appropriate sections:

```javascript
rules: {
  'new-rule': 'error',
  '@typescript-eslint/new-ts-rule': 'warn'
}
```

### Prettier Settings

Edit `.prettierrc.json` or add overrides for new file types:

```json
{
  "overrides": [
    {
      "files": "*.newext",
      "options": {
        "printWidth": 80
      }
    }
  ]
}
```

## Migration from Old Configuration

If you had an old configuration:

1. Remove old configuration files (`.eslintrc.*`)
2. Update scripts in `package.json`
3. Run `npm run lint:fix` to apply new rules
4. Check pre-commit hooks functionality

## Support

When encountering issues:

1. Check dependency versions
2. Ensure file paths are correct
3. Check command execution logs
4. Use `--debug` flags for detailed diagnostics
