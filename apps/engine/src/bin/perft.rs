use std::{env, time::Instant};

use oxchess::position::{Position, fen::FENError, movegen::perft};

fn main() -> Result<(), FENError> {
    let args: Vec<String> = env::args().collect();
    let depth = if args.len() <= 1 {
        6
    } else {
        args[1].parse().unwrap_or(6)
    };
    let mut position =
        Position::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;

    let moves = position.generate_pseudolegal_moves();
    let mut total = 0;
    let start = Instant::now();

    for &mv in &moves {
        let undo = position.make_move(mv);

        if position.in_check(!position.turn()) {
            position.undo_move(mv, undo);
            continue;
        }

        let count = if depth <= 1 {
            1
        } else {
            perft(&mut position, depth - 1)
        };
        position.undo_move(mv, undo);

        println!("{}: {}", mv, count);
        total += count;
    }

    let elapsed = start.elapsed();
    println!(
        "Total (depth {}): {} nodes in {:.3}s ({:.2} Mnps)",
        depth,
        total,
        elapsed.as_secs_f64(),
        total as f64 / elapsed.as_secs_f64() / 1_000_000.0
    );

    Ok(())
}
