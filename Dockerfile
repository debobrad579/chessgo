FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY app ./app
COPY views ./views
COPY tailwind.css postcss.config.js tsconfig.json vite.config.js ./
RUN npm run build

FROM golang:1.26-alpine AS backend
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /chessgo ./cmd/server

FROM alpine:3.20
WORKDIR /app
RUN apk --no-cache add ca-certificates && addgroup -S chessgo && adduser -S chessgo -G chessgo
COPY static ./static
COPY --from=frontend /app/dist/static/app.js ./static/app.js
COPY --from=frontend /app/dist/static/style.css ./static/style.css
COPY views ./views
COPY --from=backend /chessgo /app/chessgo
RUN chown -R chessgo:chessgo /app
USER chessgo
EXPOSE 8080
CMD ["/app/chessgo"]
