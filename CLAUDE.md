# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working in this repository.

---

## Repository Overview

This repository is currently in initial setup. This CLAUDE.md will be updated as the project evolves with source code, tooling, and conventions.

---

## Git Workflow

### Branch Naming

- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`
- AI-assisted branches: `claude/<task-id>-<slug>`
- Releases: `release/<version>`

### Commit Messages

Follow the Conventional Commits specification:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Examples:**
```
feat(auth): add JWT token refresh logic
fix(api): handle null response from upstream service
docs: update CLAUDE.md with project conventions
chore: upgrade dependencies to latest patch versions
```

### Push Rules

- Never force-push to `main` or `master`
- Always push to your designated feature branch
- Branch names for AI sessions must match the pattern: `claude/<task-id>-<slug>`
- Use `git push -u origin <branch-name>` for first-time pushes

---

## Development Workflow

### Before Starting Work

1. Check out or create the correct feature branch
2. Pull the latest changes: `git pull origin <branch-name>`
3. Review any open issues or PR descriptions for context

### Making Changes

1. Read existing files before modifying them
2. Keep changes focused — one concern per commit
3. Do not introduce unrelated refactors alongside feature work
4. Prefer editing existing files over creating new ones

### Before Committing

- Ensure all tests pass (once a test suite is configured)
- Ensure linting passes (once a linter is configured)
- Remove debug statements, commented-out code, and temporary files
- Verify no secrets or credentials are included in committed files

### Committing

```bash
git add <specific-files>          # Stage specific files, not `git add .`
git commit -m "<type>: <summary>"
git push -u origin <branch-name>
```

---

## Code Conventions (To Be Updated as Project Grows)

### General Principles

- **Simplicity first:** Write the minimum code needed to solve the problem
- **No premature abstraction:** Avoid creating utilities or helpers for one-time use
- **No speculative features:** Only implement what is explicitly requested
- **Delete unused code:** Do not comment out code or leave dead code in place
- **Trust framework guarantees:** Only add error handling at system boundaries (user input, external APIs)

### Naming

- Use descriptive names; avoid single-letter variables except in well-understood contexts (e.g., loop indices)
- Prefer explicit over abbreviated: `getUserById` not `getUsrById`

### Security

- Never commit secrets, API keys, tokens, or passwords
- Use environment variables for all sensitive configuration
- Validate all external input at system boundaries
- Be vigilant about injection vulnerabilities (SQL, shell, XSS)

---

## Environment Variables

Once the project has configuration requirements, document them here in the form:

```
VARIABLE_NAME=example_value    # Description of purpose
```

Store secrets in a `.env` file locally; never commit `.env` to version control. Provide a `.env.example` with placeholder values.

---

## Testing (To Be Configured)

Document the test framework, how to run tests, and where test files live once established. Example placeholders:

```bash
# Run all tests
<test-command>

# Run a single test file
<test-command> <path/to/test>

# Run with coverage
<test-command> --coverage
```

Test files should live alongside source files or in a dedicated `tests/` directory, following the project's established convention.

---

## Linting and Formatting (To Be Configured)

Document the linter and formatter once chosen. Example placeholders:

```bash
# Lint
<lint-command>

# Format
<format-command>
```

---

## CI/CD (To Be Configured)

Document the CI/CD pipeline (GitHub Actions, GitLab CI, etc.) once established. Include:

- Which branches trigger CI runs
- What checks must pass before merging
- How deployments are triggered

---

## Directory Structure (To Be Updated)

As the project grows, document the directory structure here:

```
/
├── src/           # Main source code
├── tests/         # Test files (if separate from src)
├── docs/          # Documentation
├── scripts/       # Utility scripts
├── .github/       # GitHub Actions workflows and PR templates
└── CLAUDE.md      # This file
```

---

## AI Assistant Guidelines

### What to Do

- Read files before modifying them
- Use the todo list to track multi-step tasks
- Make focused, minimal changes
- Commit frequently with descriptive messages
- Ask for clarification when requirements are ambiguous

### What Not to Do

- Do not push to branches other than the designated feature branch
- Do not commit generated artifacts, build outputs, or node_modules
- Do not add unrequested features, refactors, or "improvements"
- Do not guess at missing parameters — ask instead
- Do not add comments unless logic is genuinely non-obvious
- Do not amend commits that have already been pushed

### Updating This File

Update CLAUDE.md whenever:
- A new language, framework, or major dependency is added
- Build, test, or lint commands change
- New conventions are established for the project
- The directory structure changes significantly
