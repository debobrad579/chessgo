use thiserror::Error;

use crate::{position::Position, search::Search, uci::position::MoveError};

#[derive(Debug, Error)]
pub enum GoCmdError {
    #[error("invalid arguments")]
    InvalidArgs,

    #[error("invalid depth: {0}")]
    InvalidDepth(String),

    #[error(transparent)]
    MoveError(#[from] MoveError),
}

pub fn go_cmd(position: &mut Position, args: &[&str]) -> Result<Search, GoCmdError> {
    match args {
        ["depth", depth] => {
            let depth: u32 = depth
                .parse()
                .map_err(|_| GoCmdError::InvalidDepth(depth.to_string()))?;

            let mut search = Search::default();
            for current_depth in 1..=depth {
                search.negamax(position, current_depth, -2_000_000_000, 2_000_000_000, 0);
            }

            Ok(search)
        }
        [..] => Err(GoCmdError::InvalidArgs),
    }
}
