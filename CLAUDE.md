# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

**Full stack (concurrent):**
```bash
./run.sh                          # Runs frontend + backend together
```

**Docker:**
```bash
docker compose up -d                                    # Development
docker compose -f docker-compose.production.yml up      # Production
```

### Backend (`backend/`)

```bash
uv sync --locked                  # Install dependencies (with dev deps)
uv sync --no-dev --locked         # Install production only

# Development server (with reload):
ENVIRONMENT=DEVELOPMENT uv run gunicorn \
  -k bracket.uvicorn.RestartableUvicornWorker \
  bracket.app:app --bind localhost:8400 --workers 1 --reload

# Tests:
uv run pytest --cov --cov-report=xml .

# Linting & type checking:
uv run mypy .                     # Type checking
uv run pylint bracket tests cli.py
uv run ruff format --check .      # Format check
uv run ruff check .               # Lint
uv run vulture                    # Unused code detection

# Database:
alembic upgrade head              # Run migrations
uv run ./cli.py create-dev-db     # Seed dev data
uv run ./cli.py register-user     # Register a user
uv run ./cli.py generate_openapi  # Regenerate OpenAPI schema
```

### Frontend (`frontend/`)

```bash
pnpm install                      # Install dependencies
pnpm run dev                      # Vite dev server
pnpm run build                    # Production build
pnpm run prettier:write           # Format code
pnpm run prettier:check           # Check formatting
pnpm run typecheck                # TypeScript check
pnpm run openapi-ts               # Regenerate types from OpenAPI schema
pnpm test                         # Runs prettier:write + typecheck
```

## Architecture

Self-hosted tournament management system. Fork of [evroon/bracket](https://github.com/evroon/bracket).

### Backend

Python 3.12+ / FastAPI async REST API with PostgreSQL.

**Code layout** (`backend/bracket/`):
- `app.py` - FastAPI app setup, router registration, middleware, lifespan
- `config.py` - Environment-based config (`ci.env`, `dev.env`, `prod.env`, `demo.env`)
- `routes/` - 18 API routers (auth, clubs, courts, matches, officials, players, rankings, rounds, stages, stage_items, teams, tournaments, users, etc.)
- `logic/` - Business logic: `planning/` (tournament bracket algorithms), `scheduling/` (match scheduling), `ranking/` (ranking calculation), `subscriptions.py` (WebSocket)
- `models/db/` - 18 SQLAlchemy ORM models
- `sql/` - Async SQL query functions (one file per entity, 15 files)
- `schema.py` - Pydantic request/response DTOs
- `utils/security.py` - Password hashing, JWT handling

**Database:** PostgreSQL with Alembic migrations (20+ versions in `alembic/versions/`). Supports single elimination, round-robin, and Swiss tournament formats.

**Authentication:** JWT-based. Secret via `JWT_SECRET` env var. Default dev credentials: `test@example.org` / `aeGhoe1ahng2Aezai0Dei6Aih6dieHoo`.

**API prefix:** Configurable via `API_PREFIX` env var (use `/api` in production).

### Frontend

React 19 + TypeScript + Vite 7 + Mantine 8 UI library.

**Code layout** (`frontend/src/`):
- `main.tsx` - Entry point with route definitions, Mantine theme, i18next setup
- `pages/` - React Router v7 pages with dynamic segments (`[id]`, `[stage_item_id]`). Tournament pages: players, teams, schedule, standings, rankings, results, settings, bracket, official-portal
- `services/` + `openapi/` - Auto-generated API client from OpenAPI spec via `@hey-api/openapi-ts`
- `components/` - Reusable components and modals

**Key frontend patterns:**
- API types auto-generated from backend OpenAPI schema (`pnpm run openapi-ts`)
- SWR for data fetching
- i18next with browser language detection (Crowdin translations)
- @hello-pangea/dnd for drag-and-drop bracket management

### CI/CD

GitHub Actions workflows:
- `backend.yml` - pytest, coverage (Codecov), mypy, pylint, ruff, vulture
- `frontend.yml` - prettier, typecheck

## Configuration

Environment files in `backend/`: `dev.env`, `prod.env`, `ci.env`, `demo.env`

Key env vars: `ENVIRONMENT`, `JWT_SECRET`, `PG_DSN`, `CORS_ORIGINS`, `SERVE_FRONTEND`, `API_PREFIX`

Docker images: `thunderdanp/bracket-frontend`, `thunderdanp/bracket-backend`
