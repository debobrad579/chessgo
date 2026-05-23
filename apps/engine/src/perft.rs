use std::time::Instant;

use crate::state::State;

pub fn perft(state: &State, depth: u32) -> u64 {
    if depth == 0 {
        return 1;
    }

    let moves = state.get_legal_moves();

    if depth == 1 {
        return moves.len() as u64;
    }

    moves
        .iter()
        .map(|&mv| {
            let mut new_board = *state;
            new_board.make_move(mv);
            perft(&new_board, depth - 1)
        })
        .sum()
}

pub fn perft_divide(state: &State, depth: u32) {
    let moves = state.get_legal_moves();
    let mut total = 0;

    let start = Instant::now();
    for &mv in &moves {
        let mut new_board = *state;
        new_board.make_move(mv);
        let count = if depth <= 1 {
            1
        } else {
            perft(&new_board, depth - 1)
        };
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
