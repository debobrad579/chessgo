FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY app ./app
COPY views ./views
COPY input.css tailwind.config.js postcss.config.js tsconfig.json esbuild.mjs ./
RUN npm run build

FROM golang:1.25-alpine AS backend
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /chessgo ./cmd/server

FROM alpine:3.20
WORKDIR /app
RUN apk --no-cache add ca-certificates && addgroup -S chessgo && adduser -S chessgo -G chessgo
COPY static ./static
COPY --from=frontend /app/static/app.js ./static/app.js
COPY --from=frontend /app/static/style.css ./static/style.css
COPY views ./views
COPY app/index.html ./app/index.html
COPY --from=backend /chessgo /app/chessgo
RUN chown -R chessgo:chessgo /app
USER chessgo
EXPOSE 3000
CMD ["/app/chessgo"]
