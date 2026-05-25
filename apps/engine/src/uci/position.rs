use thiserror::Error;

use crate::{
    position::{Position, fen::FENError},
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

#[derive(Debug, Error)]
pub enum MoveError {
    #[error("invalid move format: {0}")]
    InvalidMoveFormat(String),

    #[error("invalid promotion: {0}")]
    InvalidPromotion(String),

    #[error("illegal move: {0}")]
    IllegalMove(String),
}

pub fn parse_move(position: &mut Position, move_str: &str) -> Result<Move, MoveError> {
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

    Ok(position
        .generate_pseudolegal_moves(position.turn)
        .into_iter()
        .find(|mv| {
            if mv.source() != source as u32
                || mv.target() != target as u32
                || mv.promotion() != promotion
            {
                return false;
            }

            let undo = position.make_move(*mv);
            let legal = !position.in_check(!position.turn);
            position.undo_move(*mv, undo);
            legal
        })
        .ok_or_else(|| MoveError::IllegalMove(move_str.to_string())))?
}

pub fn position_cmd(args: &[&str]) -> Result<Position, PositionCmdError> {
    match args {
        ["startpos"] => Ok(Position::try_from(STARTPOS)?),
        ["startpos", "moves", moves @ ..] => {
            let mut position = Position::try_from(STARTPOS)?;
            for mv in moves {
                let mv = parse_move(&mut position, mv)?;
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
                    let mv = parse_move(&mut position, mv)?;
                    position.make_move(mv);
                }
            }

            Ok(position)
        }
        [..] => Err(PositionCmdError::InvalidArgs),
    }
}

#[cfg(test)]
mod test {
    use crate::{
        position::Position,
        types::PromotionPiece,
        uci::position::{STARTPOS, parse_move, position_cmd},
    };

    const TEST_FEN: &str = "r2q1rk1/pp1bbppp/2n1pn2/2pp4/3P4/2PBPN2/PPQ2PPP/R1B2RK1 w - - 0 10";

    #[test]
    fn parse_starting_pos_moves() {
        let position =
            &mut Position::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
                .unwrap();

        let mv = parse_move(position, "e2e4").unwrap();
        assert_eq!(mv.source(), 12);
        assert_eq!(mv.target(), 28);
        assert_eq!(mv.promotion(), None);

        let mv = parse_move(position, "d2d4").unwrap();
        assert_eq!(mv.source(), 11);
        assert_eq!(mv.target(), 27);
        assert_eq!(mv.promotion(), None);

        let mv = parse_move(position, "c2c4").unwrap();
        assert_eq!(mv.source(), 10);
        assert_eq!(mv.target(), 26);
        assert_eq!(mv.promotion(), None);

        let mv = parse_move(position, "g1f3").unwrap();
        assert_eq!(mv.source(), 6);
        assert_eq!(mv.target(), 21);
        assert_eq!(mv.promotion(), None);
    }

    #[test]
    fn parse_promotion() {
        let position = &mut Position::try_from("6k1/R1P5/8/8/8/6K1/8/8 w - - 0 30").unwrap();

        let mv = parse_move(position, "c7c8q").unwrap();
        assert_eq!(mv.source(), 50);
        assert_eq!(mv.target(), 58);
        assert_eq!(mv.promotion(), Some(PromotionPiece::Queen));

        let mv = parse_move(position, "c7c8r").unwrap();
        assert_eq!(mv.source(), 50);
        assert_eq!(mv.target(), 58);
        assert_eq!(mv.promotion(), Some(PromotionPiece::Rook));

        let mv = parse_move(position, "c7c8b").unwrap();
        assert_eq!(mv.source(), 50);
        assert_eq!(mv.target(), 58);
        assert_eq!(mv.promotion(), Some(PromotionPiece::Bishop));

        let mv = parse_move(position, "c7c8n").unwrap();
        assert_eq!(mv.source(), 50);
        assert_eq!(mv.target(), 58);
        assert_eq!(mv.promotion(), Some(PromotionPiece::Knight));
    }

    #[test]
    fn parse_position_cmd_startpos() {
        assert_eq!(
            position_cmd(&["startpos"]).unwrap(),
            Position::try_from(STARTPOS).unwrap(),
        );
    }

    #[test]
    fn parse_position_cmd_moves() {
        assert!(position_cmd(&["startpos", "moves", "e2e4", "e7e5", "b1c3", "g8f6"]).is_ok());
    }

    #[test]
    fn parse_position_cmd_fen() {
        assert_eq!(
            position_cmd(&["fen", TEST_FEN]).unwrap(),
            Position::try_from(TEST_FEN).unwrap(),
        );
    }

    #[test]
    fn parse_position_cmd_fen_moves() {
        assert!(
            position_cmd(&[
                "fen", TEST_FEN, "moves", "d4c5", "e7c5", "e3e4", "d5e4", "d3e4", "f6e4", "c2e4"
            ])
            .is_ok()
        );
    }
}
