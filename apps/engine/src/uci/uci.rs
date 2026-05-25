use thiserror::Error;

use crate::{
    position::Position,
    position::fen::FENError,
    types::{Move, PromotionPiece},
};

const STARTPOS: &str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

#[derive(Debug, Error)]
pub enum PositionCmdError {
    #[error("invalid arguments")]
    InvalidArgs,

    #[error(transparent)]
    FENError(#[from] FENError),

    #[error(transparent)]
    MoveError(#[from] MoveError),
}

impl Position {
    pub fn from_position_cmd(args: &[&str]) -> Result<Self, PositionCmdError> {
        match args {
            ["startpos"] => Ok(Position::try_from(STARTPOS)?),
            ["startpos", "moves", moves @ ..] => {
                let mut position = Position::try_from(STARTPOS)?;
                for mv in moves {
                    let mv = position.parse_move(mv)?;
                    position.make_move(mv);
                }
                Ok(position)
            }
            ["fen", rest @ ..] => {
                let (fen, moves): (&str, Option<&[&str]>) =
                    if let Some(idx) = rest.iter().position(|x| *x == "moves") {
                        (&rest[..idx].join(" "), Some(&rest[idx + 1..]))
                    } else {
                        (&rest.join(" "), None)
                    };

                let mut position = Position::try_from(fen)?;
                if let Some(moves) = moves {
                    for mv in moves {
                        let mv = position.parse_move(mv)?;
                        position.make_move(mv);
                    }
                }

                Ok(position)
            }
            [..] => Err(PositionCmdError::InvalidArgs),
        }
    }
}

#[cfg(test)]
mod test {}
