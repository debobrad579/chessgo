# ChessGo

A real-time multiplayer chess web app built with Go and React.

## Live Site

Visit [chessgo.ca](https://www.chessgo.ca)

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
├── apps/
│   ├── api/                     # Go REST API + WebSocket server
│   │   ├── cmd/server/          # Application entry point
│   │   └── internal/            # Backend Go modules
│   │       ├── appmetrics/      # Prometheus metrics
│   │       ├── auth/            # JWT, password hashing, refresh tokens
│   │       ├── chess/           # Chess game state and move validation
│   │       ├── database/        # Database layer (sqlc-generated)
│   │       ├── handlers/        # HTTP handlers
│   │       ├── httperr/         # HTTP error handling and context
│   │       ├── live/            # Live game room and WebSocket connection management
│   │       ├── logging/         # Structured application logging
│   │       └── middleware/      # HTTP middleware

│   ├── app/                     # React SPA
│   │   └── src/
│   │       ├── components/      # React components
│   │       ├── context/         # React contexts
│   │       ├── hooks/           # Custom hooks
│   │       ├── lib/             # Formatters, parsers, utilities
│   │       ├── pages/           # Page-level components
│   │       ├── types/           # TypeScript types
│   │       └── App.tsx          # React entry point + router

│   └── www/                     # Astro static site
│       └── src/
│           ├── layouts/         # Astro layouts
│           └── pages/           # Astro pages

├── packages/
│   └── ui/                      # Shared React component library
│       └── src/
│           ├── components/ui/   # shadcn/ui components
│           └── lib/             # Utilities

└── sql/                         # Database schema and queries
    ├── queries/                 # SQL queries (input for sqlc)
    └── schema/                  # Goose migration files
```

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/debobrad579/chessgo.git
cd chessgo
```

2. **Configure your environment variables**

```bash
cp apps/api/.env.example apps/api/.env
cp apps/app/.env.example apps/app/.env
cp apps/www/.env.example apps/www/.env
```

Then edit `apps/api/.env` and set secure values for `POSTGRES_PASSWORD` and `TOKEN_SECRET`:

```env
POSTGRES_PASSWORD=changeme        # pick something strong
TOKEN_SECRET=changeme             # generate with: openssl rand -base64 64
CF_TUNNEL_TOKEN=changeme          # only if you're using cloudflare tunnels
```

### Option 1: Run with Docker (recommended)

```bash
docker compose --env-file /path/to/.env up
# or: docker compose --env-file /path/to/.env --profile cloudflare up
```

Docker Compose will:
- Start a PostgreSQL database
- Run all database migrations
- Start the ChessGo app

Open the app at [http://localhost:80](http://localhost:80)

To stop: `docker compose down`. To also remove the database volume: `docker compose down -v`.

### Option 2: Manual Setup

**Prerequisites**

- [Go 1.26+](https://go.dev/dl/)
- [Node.js](https://nodejs.org/) and npm
- [PostgreSQL](https://www.postgresql.org/)
- [goose](https://github.com/pressly/goose) — `go install github.com/pressly/goose/v3/cmd/goose@latest`
- [just](https://github.com/casey/just) (optional, required to run commands via `just`) - `cargo install just`
- [sqlc](https://sqlc.dev/) (optional, required for `just generate`) — `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`
- [air](https://github.com/air-verse/air) (optional, required for `just dev`) — `go install github.com/air-verse/air@latest`

**Install dependencies and run database migrations**

```bash
just install
just migrate up
```

**Run development environment** (with live reload and hot module replacement)

```bash
just dev
```

Open the app at [http://localhost:3000](http://localhost:3000)

## Available Just Targets

| Command | Description |
|---|---|
| `just install` | Download Go modules and install npm packages |
| `just dev` | Start development environment |
| `just lint` | Lint Go and TypeScript |
| `just test` | Run Go tests |
| `just generate` | Regenerate sqlc query code |
| `just migrate *args="up"` | Run database migrations via goose |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
See the [LICENSE](LICENSE) file for full details.
