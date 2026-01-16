# Heroku Deployable Rails App Template

A production-ready full-stack boilerplate with a Rails 8 API backend and React 19 frontend, configured for single-app deployment on Heroku. Use this template to quickly start new web applications without the usual setup hassle.

## What's Included

- **Rails 8 API** - Backend configured for API-only mode
- **React 19 + TypeScript** - Modern frontend with type safety
- **Material UI (MUI)** - Component library for polished, accessible UI
- **Dark Mode** - Toggle between light and dark themes with localStorage persistence
- **PostgreSQL** - Production-ready database
- **Docker** - Full development environment with one command
- **Single-App Deployment** - Rails serves the React build from `public/`
- **Testing** - RSpec (Rails) and Jest (React) pre-configured
- **Linting** - RuboCop (Ruby) and ESLint (TypeScript) ready to go
- **Pre-commit Hooks** - Husky + lint-staged for automatic linting on commit
- **Heroku-Ready** - Procfile, production config, and Postgres addon support

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rails 8 (API mode) |
| Frontend | React 19, TypeScript, Material UI |
| Database | PostgreSQL |
| Testing | RSpec, Jest |
| Linting | RuboCop, ESLint |
| Deployment | Docker, Heroku |

## Prerequisites

Before you start, make sure you have:

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Heroku CLI** - `heroku --version` (for deployment)

## Getting Started

### 1. Use This Template

Click "Use this template" on GitHub, or clone manually:

```bash
git clone https://github.com/YOUR_USERNAME/heroku-deployable-rails-app-template.git my-new-app
cd my-new-app
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
```

### 2. Start the Application

```bash
# Start all services (PostgreSQL, Rails API, React frontend)
docker compose up
```

Wait for the services to start. You'll see output like:
```
api-1       | * Listening on http://0.0.0.0:3000
frontend-1  | Compiled successfully!
```

### 3. Set Up the Database

In a new terminal:

```bash
docker compose exec api rails db:create db:migrate
```

### 4. Open the App

- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000

That's it! You're ready to develop.

## Development

### Starting/Stopping Services

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# View logs (when running in background)
docker compose logs -f

# Stop all services
docker compose down
```

### Running Commands

```bash
# Rails console
docker compose exec api rails console

# Run migrations
docker compose exec api rails db:migrate

# Generate a model
docker compose exec api rails generate model Post title:string body:text

# Install a new gem (after adding to Gemfile)
docker compose exec api bundle install
# Then rebuild: docker compose build api
```

### Running Tests

```bash
# Rails tests
docker compose exec api bundle exec rspec

# React tests
docker compose exec frontend npm test

# React tests with coverage
docker compose exec frontend npm run test:coverage
```

### Running Linters

```bash
# Ruby
docker compose exec api bundle exec rubocop

# TypeScript
docker compose exec frontend npm run lint

# TypeScript type checking
docker compose exec frontend npm run typecheck
```

### Rebuilding Containers

After changing `Gemfile` or `Dockerfile.dev`:

```bash
docker compose build api
docker compose up
```

## Rename Your App

Update these files with your app name:

```bash
# Update database name in docker-compose.yml
# Change DATABASE_URL from myapp_development to yourappname_development
```

## Generate Credentials (for Heroku deployment)

```bash
docker compose exec api bash -c 'EDITOR="cat" rails credentials:edit'
```

Save the `config/master.key` file - you'll need it for Heroku.

## Deploying to Heroku

### First-Time Setup

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# 3. Set your master key (from config/master.key)
heroku config:set RAILS_MASTER_KEY=$(cat config/master.key)

# 4. Build React for production
docker compose exec frontend npm run build
cp -r frontend/build/* public/

# 5. Commit the build
git add .
git commit -m "Build frontend for production"

# 6. Deploy
git push heroku master

# 7. Run migrations
heroku run rails db:migrate
```

### Subsequent Deploys

```bash
# If frontend changed, rebuild it
docker compose exec frontend npm run build
cp -r frontend/build/* public/

# Commit and push
git add .
git commit -m "Your commit message"
git push heroku master
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Heroku                        │
│  ┌───────────────────────────────────────────┐  │
│  │              Rails Server                 │  │
│  │  ┌─────────────────┐  ┌────────────────┐  │  │
│  │  │  API Routes     │  │  Static Files  │  │  │
│  │  │  /api/v1/*      │  │  public/*      │  │  │
│  │  │  (JSON)         │  │  (React build) │  │  │
│  │  └─────────────────┘  └────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│                      │                          │
│              ┌───────┴───────┐                  │
│              │   PostgreSQL  │                  │
│              └───────────────┘                  │
└─────────────────────────────────────────────────┘
```

- **API routes** (`/api/v1/*`) return JSON
- **All other routes** serve the React SPA from `public/index.html`
- **React** handles client-side routing

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `api` | 3000 | Rails API server |
| `frontend` | 3001 | React dev server with hot reload |
| `db` | 5432 | PostgreSQL database |

## Dark Mode

The app includes a dark mode toggle in the navbar. Features:

- **Toggle button** - Click the sun/moon icon to switch themes
- **Persistence** - Theme preference is saved to localStorage
- **System preference** - Respects `prefers-color-scheme` on first visit
- **MUI integration** - Uses Material UI's built-in theming system

The theme is managed via React Context (`ThemeContext`) and can be accessed in any component:

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { mode, toggleTheme } = useTheme();
  // mode is 'light' or 'dark'
}
```

## Pre-commit Hooks

This template uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged) to automatically run linters and tests before each commit.

**What runs on commit:**
1. **Linting (via lint-staged):**
   - Ruby files: RuboCop with auto-correct
   - TypeScript files: ESLint and TypeScript type checking
2. **Test suites (always run):**
   - RSpec test suite with coverage check
   - Jest test suite with coverage check

The hooks are automatically enabled after running `npm install` in the project root.

> **Note:** Running full test suites on every commit is not the most efficient approach for larger projects. As your codebase grows, consider moving test execution to CI/CD pipelines (GitHub Actions, CircleCI, etc.) and keeping only linting in pre-commit hooks. This template runs tests in pre-commit hooks as a starting point to ensure code quality from day one.

## Test Coverage Requirements

The project enforces minimum test coverage thresholds. Commits will be rejected if coverage drops below these levels:

**Rails (SimpleCov):**
- Overall coverage: 100%
- Per-file minimum: 80%

**React (Jest):**
- Statements: 99%
- Branches: 90%
- Functions: 95%
- Lines: 99%

Run coverage reports:

```bash
# Rails coverage
docker compose exec api bundle exec rspec
# View report: open coverage/index.html

# React coverage
docker compose exec frontend npm run test:coverage
```

## Project Structure

```
/
├── app/
│   └── controllers/
│       ├── application_controller.rb
│       └── frontend_controller.rb  # Serves React app
├── config/
│   ├── database.yml               # Database config
│   ├── routes.rb                  # API and catch-all routes
│   └── initializers/
│       └── cors.rb                # CORS for local dev
├── frontend/                      # React application
│   ├── src/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   └── package.json
├── spec/                          # RSpec tests
├── public/                        # Built React app (production)
├── Dockerfile                     # Production Docker image
├── Dockerfile.dev                 # Development Docker image
├── docker-compose.yml             # Local development services
├── Procfile                       # Heroku process config
└── Gemfile                        # Ruby dependencies
```

## Common Issues

### Container won't start

Make sure Docker Desktop is running (whale icon in menu bar).

### Database connection errors

```bash
# Recreate the database
docker compose exec api rails db:drop db:create db:migrate
```

### Stale containers after code changes

```bash
# Rebuild and restart
docker compose down
docker compose build
docker compose up
```

### Port already in use

```bash
# Stop all containers and try again
docker compose down
docker compose up
```

### CORS Errors in Development

The React dev server runs on port 3001 and proxies to Rails on 3000. CORS is configured in `config/initializers/cors.rb` to allow this.

---

*Forked from [login](https://github.com/YOUR_USERNAME/login) at commit `396be90`*
