use std::env;

use oxchess::{fen::FENError, perft::perft_divide, state::State};

fn main() -> Result<(), FENError> {
    let args: Vec<String> = env::args().collect();
    let depth = if args.len() <= 1 {
        6
    } else {
        args[1].parse().unwrap_or(6)
    };
    let mut state = State::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;

    perft_divide(&mut state, depth);

    Ok(())
}
