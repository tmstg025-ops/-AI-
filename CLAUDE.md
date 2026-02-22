# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working in this repository.

---

## Repository Overview

**家計ダッシュボード** — a personal asset and expense management web application targeting Japanese users.

The app lets users track bank accounts/cards, record income/expense transactions, and view a summary dashboard. It is a server-rendered single-page web app (no frontend build step).

**Current state:** Working prototype with dashboard view. Full CRUD for accounts, transactions, and categories is not yet implemented.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (CommonJS) |
| Web framework | Express.js 5.x |
| ORM | Prisma 7.x (`@prisma/adapter-better-sqlite3`) |
| Database | SQLite (via `better-sqlite3`) |
| Frontend | Server-side rendered HTML + Tailwind CSS (CDN, no build step) |
| Package manager | npm |
| Config format | JavaScript (`.js`), with one TypeScript config file (`prisma.config.ts`) |

> **Note:** `DOCS.md` outlines a future architecture using Next.js + TypeScript. The current implementation uses Express.js + plain JavaScript. Do not assume Next.js conventions apply.

---

## Directory Structure

```
/
├── src/
│   ├── server.js        # Express app entry point; all routes and HTML rendering
│   └── db.js            # Prisma client singleton (better-sqlite3 adapter)
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Prisma migration history
│   └── seed.js          # Seed script with sample Japanese data
├── prisma.config.ts     # Prisma CLI configuration (schema path, DB path)
├── package.json
├── .gitignore
├── CLAUDE.md            # This file
└── DOCS.md              # Product requirements (Japanese)
```

---

## Database Schema

Defined in `prisma/schema.prisma`. Provider: `sqlite`.

### Account
| Field | Type | Notes |
|---|---|---|
| id | Int (autoincrement) | Primary key |
| name | String | e.g. "普通預金（メインバンク）" |
| balance | Decimal | Current balance in JPY |
| type | String | `checking` / `savings` / `investment` |

### Category
| Field | Type | Notes |
|---|---|---|
| id | Int (autoincrement) | Primary key |
| name | String | e.g. "給与", "食費" |
| type | String | `income` / `expense` / `transfer` |

### Transaction
| Field | Type | Notes |
|---|---|---|
| id | Int (autoincrement) | Primary key |
| date | DateTime | Transaction date |
| description | String | Free-text memo |
| amount | Decimal | Positive = income, negative = expense (in JPY) |
| categoryId | Int | FK → Category |
| accountId | Int | FK → Account |

**Amount convention:** positive values represent income, negative values represent expenses. This is enforced in application logic, not at the DB level.

---

## Environment Variables

```
DATABASE_URL="file:./prisma/dev.db"   # SQLite DB file path (used by Prisma CLI)
PORT=3000                              # HTTP port (optional; defaults to 3000)
```

The DB path for the runtime client is hardcoded in `src/db.js` using `path.resolve`. The `DATABASE_URL` env var is used by Prisma CLI commands (migrations, studio).

Store secrets in `.env` (gitignored). Never commit `.env`.

---

## Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client after schema changes
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with sample data (resets all data first)
npm run seed

# Start development server
npm start
# → http://localhost:3000
```

No test suite or linter is configured yet. The `npm test` script exits with an error (placeholder).

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
feat(dashboard): add transaction filter by category
fix(db): handle missing account in transaction query
docs: update CLAUDE.md with actual tech stack
chore: upgrade prisma to latest patch version
```

### Push Rules

- Never force-push to `main` or `master`
- Always push to your designated feature branch
- Branch names for AI sessions must match the pattern: `claude/<task-id>-<slug>`
- Use `git push -u origin <branch-name>` for first-time pushes

---

## Code Conventions

### General Principles

- **Simplicity first:** Write the minimum code needed to solve the problem
- **No premature abstraction:** Avoid creating utilities or helpers for one-time use
- **No speculative features:** Only implement what is explicitly requested
- **Delete unused code:** Do not comment out or leave dead code in place
- **Trust framework guarantees:** Only add error handling at system boundaries (user input, external APIs)

### JavaScript Style

- All source files use `'use strict'` and CommonJS (`require`/`module.exports`)
- Do not introduce ES modules (`import`/`export`) or TypeScript in `src/` or `prisma/` without explicit instruction
- Use descriptive names; avoid single-letter variables except in well-understood contexts (e.g., loop indices)
- Prefer explicit over abbreviated: `getUserById` not `getUsrById`

### HTML Rendering

- The server renders HTML strings directly in `src/server.js` using template literals
- Tailwind CSS is loaded from CDN — no PostCSS or build step
- Japanese locale is used throughout: `Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })`

### Security

- Never commit secrets, API keys, tokens, or passwords
- Use environment variables for all sensitive configuration
- Validate all external input at system boundaries
- Be vigilant about injection vulnerabilities (SQL, shell, XSS)

---

## Testing (Not Yet Configured)

No test framework is set up. When adding tests, document the framework and commands here and update `package.json`.

---

## Linting and Formatting (Not Yet Configured)

No linter or formatter is configured. DOCS.md plans to use ESLint + Prettier. When added, document the commands here.

---

## CI/CD (Not Yet Configured)

No CI/CD pipeline exists. When added, document which branches trigger runs and what checks must pass.

---

## AI Assistant Guidelines

### What to Do

- Read files before modifying them
- Use the todo list to track multi-step tasks
- Make focused, minimal changes — one concern per commit
- Commit frequently with descriptive messages
- Ask for clarification when requirements are ambiguous

### What Not to Do

- Do not push to branches other than the designated feature branch
- Do not commit generated artifacts, build outputs, `node_modules`, or `prisma/dev.db`
- Do not add unrequested features, refactors, or "improvements"
- Do not guess at missing parameters — ask instead
- Do not add comments unless logic is genuinely non-obvious
- Do not amend commits that have already been pushed
- Do not introduce TypeScript or ES modules into `src/` without explicit instruction

### Updating This File

Update CLAUDE.md whenever:
- A new language, framework, or major dependency is added
- Build, test, or lint commands are established or change
- New conventions are established for the project
- The directory structure changes significantly
- The database schema changes materially
