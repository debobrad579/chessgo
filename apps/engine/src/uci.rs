use thiserror::Error;

use crate::{moves::Move, state::State};

#[derive(Debug, Error)]
pub enum UCIError {
    #[error("invalid move: {0}")]
    InvalidMove(String),
}

impl State {
    pub fn parse_move(mv: &str) -> Move {
        todo!()
    }
}
