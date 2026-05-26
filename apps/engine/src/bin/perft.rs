use std::env;

use oxchess::{movegen::perft::perft_divide, position::Position, position::fen::FENError};

fn main() -> Result<(), FENError> {
    let args: Vec<String> = env::args().collect();
    let depth = if args.len() <= 1 {
        6
    } else {
        args[1].parse().unwrap_or(6)
    };
    let mut position =
        Position::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;

    perft_divide(&mut position, depth);

    Ok(())
}
