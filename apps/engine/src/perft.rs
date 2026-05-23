use crate::state::State;
use std::time::Instant;

pub fn perft(state: &mut State, depth: u32) -> u64 {
    if depth == 0 {
        return 1;
    }

    let moves = state.generate_pseudolegal_moves(state.turn);
    let mut result = 0;

    for mv in moves {
        let undo = state.make_move(mv);
        if !state.in_check(!state.turn) {
            result += perft(state, depth - 1);
        }
        state.undo_move(mv, undo);
    }

    result
}

pub fn perft_divide(state: &mut State, depth: u32) {
    let moves = state.generate_pseudolegal_moves(state.turn);
    let mut total = 0;
    let start = Instant::now();

    for &mv in &moves {
        let undo = state.make_move(mv);

        if state.in_check(!state.turn) {
            state.undo_move(mv, undo);
            continue;
        }

        let count = if depth <= 1 {
            1
        } else {
            perft(state, depth - 1)
        };
        state.undo_move(mv, undo);

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
