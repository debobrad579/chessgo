set dotenv-load

# Run arbitrary cargo commands
[group("cmd")]
cargo *args:
  @cd apps/engine && cargo {{args}}

# Run arbitrary go commands
[group("cmd")]
go *args:
  @cd apps/api && go {{args}}

# Run arbitrary pnpm commands
[group("cmd")]
[arg("app", pattern="^(app|www)$")]
pnpm app *args:
  @cd apps/{{app}} && pnpm {{args}}

# Install dependencies
[group("install")]
install:
  @echo "Installing dependencies..."
  @pnpm install
  @cd apps/api && go mod download
  @cd apps/engine && cargo check

# Start development environment
[group("dev")]
dev:
  @pnpm dlx concurrently \
    -n API,APP,WWW,BOT \
    -c blue,magenta,yellow,green \
    "cd apps/api && DEV=true air" \
    "cd apps/app && pnpm run dev" \
    "cd apps/www && pnpm run dev" \
    "cd apps/engine && cargo-watch -- cargo run --bin tcp --release"

# Lint application
[group("dev")]
[arg("app", pattern="^(api|app|www)$")]
lint app:
  @case {{app}} in \
    api) cd apps/api && go vet ./... ;; \
    app) cd apps/app && pnpm lint && pnpm exec tsc ;; \
    www) cd apps/www && pnpm lint && pnpm exec tsc ;; \
  esac;

# Lint all applications in parallel
[group("dev")]
lint-all:
  @pnpm dlx concurrently \
    -n API,APP,WWW \
    -c blue,magenta,yellow \
    "cd apps/api && go vet ./..." \
    "cd apps/app && pnpm lint && pnpm exec tsc" \
    "cd apps/www && pnpm lint && pnpm exec tsc"

# Run tests
[group("dev")]
[arg("app", pattern="^(api|bot)$")]
test app:
  @case {{app}} in \
    api) cd apps/api && go test ./... ;; \
    bot) cd apps/engine && cargo test ;; \
  esac;

# Run all tests in parallel
[group("dev")]
test-all:
  @pnpm dlx concurrently \
    -n API,BOT \
    -c blue,green \
    "cd apps/api && go test ./..." \
    "cd apps/engine && cargo test --color=always"

# Run engine move generation performance test
[group("engine")]
perft depth="6":
  @cd apps/engine && cargo run --bin perft --release -- {{depth}}

# Run engine search node count test
[group("engine")]
search depth="6":
  @cd apps/engine && cargo run --bin search --release -- {{depth}}

# Run engine sequential probability ratio test
[group("engine")]
[arg("rounds", long="rounds")]
[arg("threads", long="threads")]
sprt new old rounds="200" threads="4":
  @fastchess \
    -config outname=./apps/engine/target/sprt.json \
    -engine cmd=./apps/engine/target/sprt/{{new}} name={{new}} \
    -engine cmd=./apps/engine/target/sprt/{{old}} name={{old}} \
    -openings file="$SPRT_BOOK_FILEPATH" format=pgn order=random \
    -rounds {{rounds}} -repeat -concurrency {{threads}} \
    -each tc=1+0.1 timemargin=1000 \
    -sprt elo0=0 elo1=10 alpha=0.05 beta=0.05

# Build an engine binary for SPRT
[group("engine")]
build-sprt name:
  @cd apps/engine && cargo build --release --bin cli
  @mkdir -p apps/engine/target/sprt
  @cp apps/engine/target/release/cli apps/engine/target/sprt/{{name}}


# Regenerate sqlc query code
[group("dev")]
generate:
  @echo "Generating sqlc query code..."
  @sqlc generate

# Run database migrations via goose
[group("migrations")]
migrate *args="up":
  @goose -dir sql/schema postgres \
    "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB?sslmode=disable" \
    {{args}}

# Build application
[group("staging")]
[arg("app", pattern="^(ui|api|app|bot|www)$")]
build app:
  @case {{app}} in \
    ui) cd packages/ui && pnpm run build ;; \
    api) cd apps/api && go build -o dist/chessgo ./cmd/server ;; \
    app) cd apps/app && pnpm run build --mode preview ;; \
    bot) cd apps/engine && cargo build --release ;; \
    www) cd apps/www && pnpm run build --mode preview ;; \
  esac;

# Build all applications in parallel
[group("staging")]
build-all:
  @echo "Building UI..."
  @cd packages/ui && pnpm run build
  @pnpm dlx concurrently \
    -n API,APP,WWW,BOT \
    -c blue,magenta,yellow,green \
    "cd apps/api && go build -o dist/chessgo ./cmd/server" \
    "cd apps/app && pnpm run build --mode preview" \
    "cd apps/www && pnpm run build --mode preview" \
    "cd apps/engine && cargo build --release"

# Start production environment
[group("staging")]
preview:
  @pnpm dlx concurrently \
    -n API,APP,WWW,BOT \
    -c blue,magenta,yellow,green \
    "cd apps/api && APP_ORIGIN=http://localhost:4173 ./dist/chessgo" \
    "cd apps/app && pnpm run preview" \
    "cd apps/www && pnpm run preview" \
    "./apps/engine/target/release/tcp"
