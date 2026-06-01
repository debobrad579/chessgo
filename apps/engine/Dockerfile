FROM rust:latest AS builder
WORKDIR /app
COPY . .
RUN RUSTFLAGS="-C target-cpu=native" cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/tcp /oxchess
ENTRYPOINT ["/oxchess"]
