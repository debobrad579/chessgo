use crate::position::Position;
use std::time::Instant;

pub fn perft(position: &mut Position, depth: u32) -> u64 {
    if depth == 0 {
        return 1;
    }

    let moves = position.generate_pseudolegal_moves(position.turn);
    let mut result = 0;

    for mv in moves {
        let undo = position.make_move(mv);
        if !position.in_check(!position.turn) {
            result += perft(position, depth - 1);
        }
        position.undo_move(mv, undo);
    }

    result
}

pub fn perft_divide(position: &mut Position, depth: u32) {
    let moves = position.generate_pseudolegal_moves(position.turn);
    let mut total = 0;
    let start = Instant::now();

    for &mv in &moves {
        let undo = position.make_move(mv);

        if position.in_check(!position.turn) {
            position.undo_move(mv, undo);
            continue;
        }

        let count = if depth <= 1 {
            1
        } else {
            perft(position, depth - 1)
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
}
