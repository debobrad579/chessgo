use std::env;

use oxchess::{
    position::{Position, fen::FENError},
    search::Search,
};

fn main() -> Result<(), FENError> {
    let args: Vec<String> = env::args().collect();
    let depth = if args.len() <= 1 {
        6
    } else {
        args[1].parse().unwrap_or(6)
    };
    let mut position =
        Position::try_from("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1")?;

    let mut search = Search::default();
    for current_depth in 1..=depth {
        search.negamax(
            &mut position,
            current_depth,
            -2_000_000_000,
            2_000_000_000,
            0,
        );
        println!("depth {}: {}", current_depth, search.nodes())
    }

    Ok(())
}
