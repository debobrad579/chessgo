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
    -n API,APP,WWW \
    -c blue,magenta,yellow \
    "cd apps/api && DEV=true air" \
    "cd apps/app && pnpm run dev" \
    "cd apps/www && pnpm run dev"

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

# Build Go API, React SPA, and Astro static site
[group("staging")]
build:
  @echo "Building API..."
  @cd apps/api && go build -o dist/chessgo ./cmd/server
  @echo "Building SPA..."
  @cd apps/app && pnpm run build --mode preview
  @echo "Building static site..."
  @cd apps/www && pnpm run build --mode preview

# Start production environment
[group("staging")]
preview:
  @pnpm dlx concurrently \
    -n API,APP,WWW \
    -c blue,magenta,yellow \
    "cd apps/api && APP_ORIGIN=http://localhost:4173 ./dist/chessgo" \
    "cd apps/app && pnpm run preview" \
    "cd apps/www && pnpm run preview"
