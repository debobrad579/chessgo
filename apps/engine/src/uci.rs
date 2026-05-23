use thiserror::Error;

use crate::{
    fen::FENError,
    moves::{Move, PromotionPiece},
    state::State,
};

const STARTPOS: &str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

#[derive(Debug, Error)]
pub enum MoveError {
    #[error("invalid move format: {0}")]
    InvalidMoveFormat(String),

    #[error("invalid promotion: {0}")]
    InvalidPromotion(String),

    #[error("illegal move: {0}")]
    IllegalMove(String),
}

#[derive(Debug, Error)]
pub enum PositionCmdError {
    #[error("invalid arguments")]
    InvalidArgs,

    #[error(transparent)]
    FENError(#[from] FENError),

    #[error(transparent)]
    MoveError(#[from] MoveError),
}

#[derive(Debug, Error)]
pub enum GoCmdError {
    #[error("invalid arguments")]
    InvalidArgs,

    #[error("invalid depth: {0}")]
    InvalidDepth(String),

    #[error(transparent)]
    MoveError(#[from] MoveError),
}

impl State {
    pub fn parse_move(&mut self, move_str: &str) -> Result<Move, MoveError> {
        let (source, target, promotion) = match move_str.as_bytes() {
            [file, rank, target_file, target_rank] => (
                (file - b'a') + (rank - b'1') * 8,
                (target_file - b'a') + (target_rank - b'1') * 8,
                None,
            ),
            [file, rank, target_file, target_rank, promotion] => (
                (file - b'a') + (rank - b'1') * 8,
                (target_file - b'a') + (target_rank - b'1') * 8,
                Some(match promotion {
                    b'q' => PromotionPiece::Queen,
                    b'r' => PromotionPiece::Rook,
                    b'b' => PromotionPiece::Bishop,
                    b'n' => PromotionPiece::Knight,
                    _ => return Err(MoveError::InvalidPromotion(promotion.to_string())),
                }),
            ),
            [..] => return Err(MoveError::InvalidMoveFormat(move_str.to_string())),
        };

        Ok(self
            .generate_pseudolegal_moves(self.turn)
            .into_iter()
            .find(|mv| {
                if mv.source() != source as u32
                    || mv.target() != target as u32
                    || mv.promotion() != promotion
                {
                    return false;
                }

                let undo = self.make_move(*mv);
                let legal = !self.in_check(!self.turn);
                self.undo_move(*mv, undo);
                legal
            })
            .ok_or_else(|| MoveError::IllegalMove(move_str.to_string())))?
    }

    pub fn from_position_cmd(args: &[&str]) -> Result<Self, PositionCmdError> {
        match args {
            ["startpos"] => Ok(State::try_from(STARTPOS)?),
            ["startpos", "moves", moves @ ..] => {
                let mut state = State::try_from(STARTPOS)?;
                for mv in moves {
                    let mv = state.parse_move(mv)?;
                    state.make_move(mv);
                }
                Ok(state)
            }
            ["fen", rest @ ..] => {
                let (fen, moves): (&str, Option<&[&str]>) =
                    if let Some(idx) = rest.iter().position(|x| *x == "moves") {
                        (&rest[..idx].join(" "), Some(&rest[idx + 1..]))
                    } else {
                        (&rest.join(" "), None)
                    };

                let mut state = State::try_from(fen)?;
                if let Some(moves) = moves {
                    for mv in moves {
                        let mv = state.parse_move(mv)?;
                        state.make_move(mv);
                    }
                }

                Ok(state)
            }
            [..] => Err(PositionCmdError::InvalidArgs),
        }
    }

    pub fn go(&mut self, args: &[&str]) -> Result<Move, GoCmdError> {
        match args {
            ["depth", depth] => {
                let depth: u32 = depth
                    .parse()
                    .map_err(|_| GoCmdError::InvalidDepth(depth.to_string()))?;
                Ok(self.get_best_move(depth))
            }
            ["infinite"] => Ok(self.get_best_move(6)),
            [..] => Err(GoCmdError::InvalidArgs),
        }
    }
}

#[cfg(test)]
mod test {
    use crate::{moves::PromotionPiece, state::State, uci::STARTPOS};

    const TEST_FEN: &str = "r2q1rk1/pp1bbppp/2n1pn2/2pp4/3P4/2PBPN2/PPQ2PPP/R1B2RK1 w - - 0 10";

    #[test]
    fn parse_starting_pos_moves() {
        let state =
            &mut State::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
                .unwrap();

        let mv = state.parse_move("e2e4").unwrap();
        assert_eq!(mv.source(), 12);
        assert_eq!(mv.target(), 28);
        assert_eq!(mv.promotion(), None);

        let mv = state.parse_move("d2d4").unwrap();
        assert_eq!(mv.source(), 11);
        assert_eq!(mv.target(), 27);
        assert_eq!(mv.promotion(), None);

        let mv = state.parse_move("c2c4").unwrap();
        assert_eq!(mv.source(), 10);
        assert_eq!(mv.target(), 26);
        assert_eq!(mv.promotion(), None);

        let mv = state.parse_move("g1f3").unwrap();
        assert_eq!(mv.source(), 6);
        assert_eq!(mv.target(), 21);
        assert_eq!(mv.promotion(), None);
    }

    #[test]
    fn parse_promotion() {
        let state = &mut State::try_from("6k1/R1P5/8/8/8/6K1/8/8 w - - 0 30").unwrap();

        let mv = state.parse_move("c7c8q").unwrap();
        assert_eq!(mv.source(), 50);
        assert_eq!(mv.target(), 58);
        assert_eq!(mv.promotion(), Some(PromotionPiece::Queen));

        let mv = state.parse_move("c7c8r").unwrap();
        assert_eq!(mv.source(), 50);
        assert_eq!(mv.target(), 58);
        assert_eq!(mv.promotion(), Some(PromotionPiece::Rook));

        let mv = state.parse_move("c7c8b").unwrap();
        assert_eq!(mv.source(), 50);
        assert_eq!(mv.target(), 58);
        assert_eq!(mv.promotion(), Some(PromotionPiece::Bishop));

        let mv = state.parse_move("c7c8n").unwrap();
        assert_eq!(mv.source(), 50);
        assert_eq!(mv.target(), 58);
        assert_eq!(mv.promotion(), Some(PromotionPiece::Knight));
    }

    #[test]
    fn parse_position_cmd_startpos() {
        assert_eq!(
            State::from_position_cmd(&["startpos"]).unwrap(),
            State::try_from(STARTPOS).unwrap(),
        );
    }

    #[test]
    fn parse_position_cmd_moves() {
        assert!(
            State::from_position_cmd(&["startpos", "moves", "e2e4", "e7e5", "b1c3", "g8f6"])
                .is_ok()
        );
    }

    #[test]
    fn parse_position_cmd_fen() {
        assert_eq!(
            State::from_position_cmd(&["fen", TEST_FEN]).unwrap(),
            State::try_from(TEST_FEN).unwrap(),
        );
    }

    #[test]
    fn parse_position_cmd_fen_moves() {
        assert!(
            State::from_position_cmd(&[
                "fen", TEST_FEN, "moves", "d4c5", "e7c5", "e3e4", "d5e4", "d3e4", "f6e4", "c2e4"
            ])
            .is_ok()
        );
    }
}
