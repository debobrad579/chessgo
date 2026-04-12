# ChessGo

A real-time multiplayer chess web app built with Go and React.

## Features

- **Real-time gameplay** — live play against opponents via WebSockets
- **Full chess rules** — castling, en passant, promotion, check, checkmate, stalemate, threefold repetition, fifty-move rule, and insufficient material detection
- **Clocks & time controls** — bullet, blitz, and rapid time controls
- **Draw offers & resignation** — in-game draw and resign buttons
- **Rematches** — rematch requests after a game ends, swapping the color of players
- **Spectator mode** — live viewing of any ongoing game
- **Guest mode** — no account required to play or spectate
- **Accounts** — persistent game history with registration and login
- **Responsive UI** — works on desktop and mobile
- **Dark/light mode** — dark mode first, with light mode support

## Project Structure

```
.
├── cmd/server/          # Go application entry point

├── internal/            # Backend Go modules
│   ├── auth/            # JWT, password hashing, refresh tokens
│   ├── chess/           # Chess game state and move validation
│   ├── database/        # Database layer (sqlc-generated)
│   ├── handlers/        # HTTP handlers
│   └── live/            # Live game room and WebSocket connection management

├── app/                 # React + TypeScript frontend
│   ├── components/      # React components
│   ├── context/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Formatters, parsers, utilities
│   ├── pages/           # Page-level components
│   ├── types/           # TypeScript types
│   └── App.tsx          # React entry point + router

├── sql/                 # Database schema and queries
│   ├── queries/         # SQL queries (input for sqlc)
│   └── schema/          # Goose migration files

├── static/              # Static assets
├── views/               # Go HTML templates

└── dist/                # Generated build artifacts (Go binary + frontend bundle)
```

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/debobrad579/chessgo.git
cd chessgo
```

2. **Create your `.env` file**

```bash
cp .env.example .env
```

Then edit `.env` and set secure values for `POSTGRES_PASSWORD` and `TOKEN_SECRET`:

```env
POSTGRES_PASSWORD=changeme        # pick something strong
TOKEN_SECRET=changeme             # generate with: openssl rand -base64 64
```

### Option 1: Run with Docker (recommended)

1. **Start everything**

```bash
docker compose up --build
```

Docker Compose will:
- Start a PostgreSQL database
- Run all database migrations
- Build and start the ChessGo app

2. **Open the app**

Visit [http://localhost:3000](http://localhost:3000).

To stop: `docker compose down`. To also remove the database volume: `docker compose down -v`.

### Option 2: Manual Setup

**Prerequisites**

- [Go 1.26+](https://go.dev/dl/)
- [Node.js](https://nodejs.org/) and npm
- [PostgreSQL](https://www.postgresql.org/)
- [goose](https://github.com/pressly/goose) — `go install github.com/pressly/goose/v3/cmd/goose@latest`
- [sqlc](https://sqlc.dev/) (optional, required for `make generate`) — `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`
- [air](https://github.com/air-verse/air) (optional, required for `make dev`) — `go install github.com/air-verse/air@latest`

1. **Install dependencies**

```bash
make install
```

2. **Run database migrations**

```bash
make migrate up
```

**Production build**

```bash
make build
make preview
```

**Development** (with live reload)

```bash
make dev
```

## Available Make Targets

| Command | Description |
|---|---|
| `make help` | Show available make targets |
| `make install` | Download Go modules and install npm packages |
| `make dev` | Start development environment with live reload |
| `make build` | Build Go binary and frontend assets into `/dist` |
| `make preview` | Serve the production build |
| `make lint` | Lint Go and TypeScript |
| `make test` | Run Go tests |
| `make generate` | Regenerate sqlc query code |
| `make migrate up` | Apply all pending database migrations |
| `make migrate down` | Roll back the last migration |
| `make migrate status` | Show current migration status |
