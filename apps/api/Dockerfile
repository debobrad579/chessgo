FROM golang:1.26-alpine AS backend
ARG TARGETOS
ARG TARGETARCH
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o /chessgo ./cmd/server

FROM alpine:3.20
WORKDIR /app
RUN apk --no-cache add ca-certificates && addgroup -S chessgo && adduser -S chessgo -G chessgo
COPY --from=backend /chessgo /app/chessgo
RUN chown -R chessgo:chessgo /app/chessgo
USER chessgo
EXPOSE 8080
CMD ["/app/chessgo"]
