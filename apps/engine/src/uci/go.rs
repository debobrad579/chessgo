use thiserror::Error;

use crate::{position::Position, search::Search, types::Move, uci::position::MoveError};

#[derive(Debug, Error)]
pub enum GoCmdError {
    #[error("invalid arguments")]
    InvalidArgs,

    #[error("invalid depth: {0}")]
    InvalidDepth(String),

    #[error("no legal moves")]
    NoLegalMoves,

    #[error(transparent)]
    MoveError(#[from] MoveError),
}

pub fn go_cmd(position: &mut Position, args: &[&str]) -> Result<Move, GoCmdError> {
    match args {
        ["depth", depth] => {
            let depth: u32 = depth
                .parse()
                .map_err(|_| GoCmdError::InvalidDepth(depth.to_string()))?;

            let mut search = Search::new();
            search.negamax(position, depth, -2_000_000_000, 2_000_000_000, 0);

            Ok(search.bestmove().ok_or(GoCmdError::NoLegalMoves)?)
        }
        [..] => Err(GoCmdError::InvalidArgs),
    }
}
