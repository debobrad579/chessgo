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
- **Lichess integration** — lichess account integration to play in the lichess player pool
- **Responsive UI** — works on desktop and mobile
- **Dark/light mode** — dark mode first, with light mode support
- **Bot** — a chess engine written from scratch in rust

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
- [PostgreSQL](https://www.postgresql.org/)
- [pnpm](https://pnpm.io/) — `curl -fsSL https://get.pnpm.io/install.sh | sh -`
- [Rust 1.95+](https://rust-lang.org/tools/install/) — `curl https://sh.rustup.rs -sSf | sh -s -- -y`
- [goose](https://github.com/pressly/goose) — `go install github.com/pressly/goose/v3/cmd/goose@latest`
- [just](https://github.com/casey/just) (optional, required to run commands via `just`) — `cargo install just`
- [sqlc](https://sqlc.dev/) (optional, required for `just generate`) — `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`
- [air](https://github.com/air-verse/air) (optional, required for `just dev`) — `go install github.com/air-verse/air@latest`

1. **Clone the repository**

```bash
git clone https://github.com/debobrad579/chessgo.git
cd chessgo
```

2. **Configure your environment variables**

```bash
cp .env.example .env
```

Then edit `.env` and set secure values for `POSTGRES_PASSWORD`, `TOKEN_SECRET`, and `LICHESS_TOKEN_SECRET`:

```env
POSTGRES_PASSWORD=changeme        # pick something strong
TOKEN_SECRET=changeme             # generate with: openssl rand -base64 64
LICHESS_TOKEN_SECRET=changeme     # generate with: openssl rand -base64 32
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
| `just cargo [args...]` | Run arbitrary cargo commands |
| `just go [args...]` | Run arbitrary go commands |
| `just pnpm <app\|www> [args...]` | Run arbitrary pnpm commands |
| `just install` | Install dependencies |
| `just dev` | Start development environment |
| `just lint <api\|app\|www>` | Lint application |
| `just lint-all` | Lint all applications in parallel |
| `just perft [depth=6]` | Run engine perft |
| `just search [depth=6]` | Test engine search |
| `just test <api\|bot>` | Run tests |
| `just test-all` | Run all tests in parallel |
| `just generate` | Regenerate sqlc query code |
| `just migrate [args...=up]` | Run database migrations via goose |
| `just build <ui\|api\|app\|bot\|www>` | Build application |
| `just build-all` | Build all applications in parallel |
| `just preview` | Start production environment |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

This project is licensed under the GNU Affero General Public License v3.0 ([AGPL-3.0](LICENSE)).
