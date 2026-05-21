use std::time::Instant;

use crate::state::State;

pub fn perft(board: &State, depth: u32) -> u64 {
    if depth == 0 {
        return 1;
    }

    let moves = board.get_legal_moves();

    if depth == 1 {
        return moves.len() as u64;
    }

    moves
        .iter()
        .map(|&mv| {
            let mut new_board = *board;
            new_board.make_move(mv);
            perft(&new_board, depth - 1)
        })
        .sum()
}

pub fn benchmark(name: &str, f: impl FnOnce() -> u64) {
    let start = Instant::now();
    let nodes = f();
    let elapsed = start.elapsed();

    println!(
        "{}: {} nodes in {:.3}s ({:.2} Mnps)",
        name,
        nodes,
        elapsed.as_secs_f64(),
        nodes as f64 / elapsed.as_secs_f64() / 1_000_000.0
    );
}
