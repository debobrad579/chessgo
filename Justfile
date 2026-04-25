set dotenv-load

# Download Go modules and install npm packages
[group("install")]
install:
  @echo "Installing dependencies..."
  @go mod download
  @npm install

# Start development environment
[group("dev")]
dev:
  @npx concurrently \
    -n API,APP \
    -c blue,magenta \
    "DEV=true air" \
    "cd apps/app && npm run dev"

# Lint Go and TypeScript
[group("dev")]
lint:
  @echo "Linting Go..."
  @go vet ./...
  @echo "Linting TypeScript..."
  @npm run lint
  @echo "Checking types..."
  @npx tsc

# Run Go tests
[group("dev")]
test:
  @echo "Testing Go..."
  @go test ./...

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

# Build Go binary and frontend assets into /dist
[group("staging")]
[parallel]
build: lint test
  @rm -rf ./dist
  @mkdir -p ./dist
  @echo "Building Go server..."
  @go build -o ./dist/main ./cmd/server
  @echo "Building React webapp..."
  @npm run build
  @cp -r ./views ./dist/views
  @cp -r ./static/. ./dist/static

# Serve the production build
[group("staging")]
preview:
  @test -f ./dist/main || (echo "Error: binary not found, run 'just build' first" && exit 1)
  @cd ./dist && ./main
