use engine::{
    fen::FENError,
    perft::{benchmark, perft},
    state::State,
};

fn main() -> Result<(), FENError> {
    let state = State::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;

    benchmark("Starting position - depth 6", || perft(&state, 6));

    Ok(())
}
