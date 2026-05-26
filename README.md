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
│   ├── app/                     # React SPA
│   ├── engine/                  # Rust chess engine
│   └── www/                     # Astro static site
├── packages/
│   └── ui/                      # Shared shadcn/ui component library
└── sql/
    ├── queries/                 # SQL queries (input for sqlc)
    └── schema/                  # Goose migration files
```

## Getting Started

**Prerequisites**

- [Go 1.26+](https://go.dev/dl/)
- [Node.js](https://nodejs.org/) and npm
- [PostgreSQL](https://www.postgresql.org/)
- [Rust 1.95+](https://rust-lang.org/tools/install/) - `curl https://sh.rustup.rs -sSf | sh -s -- -y`
- [goose](https://github.com/pressly/goose) — `go install github.com/pressly/goose/v3/cmd/goose@latest`
- [just](https://github.com/casey/just) (optional, required to run commands via `just`) - `cargo install just`
- [sqlc](https://sqlc.dev/) (optional, required for `just generate`) — `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`
- [air](https://github.com/air-verse/air) (optional, required for `just dev`) — `go install github.com/air-verse/air@latest`

1. **Clone the repository**

```bash
git clone https://github.com/debobrad579/chessgo.git
cd chessgo
```

2. **Configure your environment variables**

```bash
cp .env.example apps/api/.env
```

Then edit `apps/api/.env` and set secure values for `POSTGRES_PASSWORD` and `TOKEN_SECRET`:

```env
POSTGRES_PASSWORD=changeme        # pick something strong
TOKEN_SECRET=changeme             # generate with: openssl rand -base64 64
```

3. **Install dependencies**

```bash
just install
```

4. **Run database migrations**

```bash
just migrate up
```

5. **Run development environment** (with live reload and hot module replacement)

```bash
just dev

# Or run production environment:
just build
just preview
```

Open the app at [http://localhost:4321](http://localhost:4321)

## Available Just Targets

| Command | Description |
|---|---|
| `just install` | Download Go modules and install npm packages |
| `just dev` | Start development environment |
| `just lint` | Lint Go and TypeScript |
| `just perft` | Run engine perft |
| `just test` | Run Go tests |
| `just generate` | Regenerate sqlc query code |
| `just migrate *args="up"` | Run database migrations via goose |
| `just build target="all"` | Build services (api, app, www, ui) |
| `just preview` | Start production environment |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

This project is licensed under the GNU Affero General Public License v3.0 ([AGPL-3.0](LICENSE)).
