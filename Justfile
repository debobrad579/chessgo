set dotenv-load

# Download Go modules and install npm packages
[group("install")]
install:
  @echo "Installing dependencies..."
  @go mod download
  @pnpm install

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

# Lint Go and TypeScript
[group("dev")]
lint:
  @echo "Linting API..."
  @cd apps/api && go vet ./...
  @echo "Linting App..."
  @cd apps/app && pnpm lint
  @echo "Checking types..."
  @cd apps/app && pnpm exec tsc

# Run Go tests
[group("dev")]
test:
  @echo "Testing Go..."
  @cd apps/api && go test ./...
  @echo "Testing Rust..."
  @cd apps/engine && cargo test

# Run engine perft
[group("dev")]
perft:
  @cd apps/engine && cargo run --bin perft --release

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

# Build applications
[group("staging")]
build target="all":
  @set -e
  @if [ "{{target}}" = "all" ]; then \
    (echo "Building API..." && cd apps/api && go build -o dist/chessgo ./cmd/server) & \
    (echo "Building APP..." && cd apps/app && pnpm run build --mode preview) & \
    (echo "Building WWW..." && cd apps/www && pnpm run build --mode preview) & \
    (echo "Building UI..." && cd packages/ui && pnpm run build) & \
    (echo "Building Engine..." && cd apps/engine && cargo build --release) & \
    wait; \
  else \
    case "{{target}}" in \
      api)    echo "Building API..." && cd apps/api && go build -o dist/chessgo ./cmd/server ;; \
      app)    echo "Building APP..." && cd apps/app && pnpm run build --mode preview ;; \
      www)    echo "Building WWW..." && cd apps/www && pnpm run build --mode preview ;; \
      ui)     echo "Building UI..." && cd packages/ui && pnpm run build ;; \
      bot) echo "Building Engine..." && cd apps/engine && cargo build --release ;; \
      *) echo "Unknown target: {{target}}. Use api|app|www|ui|all" && exit 1 ;; \
    esac; \
  fi

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
