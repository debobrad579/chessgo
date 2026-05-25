use thiserror::Error;

use crate::{position::Position, types::Move, uci::position::MoveError};

#[derive(Debug, Error)]
pub enum GoCmdError {
    #[error("invalid arguments")]
    InvalidArgs,

    #[error("invalid depth: {0}")]
    InvalidDepth(String),

    #[error(transparent)]
    MoveError(#[from] MoveError),
}

pub fn go_cmd(position: &mut Position, args: &[&str]) -> Result<Move, GoCmdError> {
    match args {
        ["depth", depth] => {
            let depth: u32 = depth
                .parse()
                .map_err(|_| GoCmdError::InvalidDepth(depth.to_string()))?;
            Ok(position.search(depth))
        }
        ["infinite"] => Ok(position.search(7)),
        [..] => Err(GoCmdError::InvalidArgs),
    }
}
