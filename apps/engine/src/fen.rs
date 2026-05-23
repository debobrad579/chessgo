use crate::{
    get_bit, set_bit,
    state::{Color, Piece, State},
};

use thiserror::Error;

#[derive(Debug, Error)]
pub enum FENError {
    #[error("invalid fen: {0}")]
    InvalidFEN(String),

    #[error("invalid pieces: {0}")]
    InvalidPieces(String),

    #[error("invalid turn: {0}")]
    InvalidTurn(String),

    #[error("invalid enpassant square: {0}")]
    InvalidEnpassant(String),

    #[error("invalid castling rights: {0}")]
    InvalidCastlingRights(String),

    #[error("invalid half move count: {0}")]
    InvalidHalfMoves(String),
}

impl TryFrom<&str> for State {
    type Error = FENError;

    fn try_from(fen: &str) -> Result<Self, Self::Error> {
        let [
            pieces,
            turn,
            castling_rights,
            enpassant,
            half_moves,
            _full_moves,
        ]: [&str; 6] = fen
            .split_whitespace()
            .collect::<Vec<_>>()
            .try_into()
            .map_err(|_| Self::Error::InvalidFEN(fen.to_string()))?;

        let mut state = Self::default();

        let mut rank = 7;
        let mut file = 0;
        for c in pieces.chars() {
            match c {
                '/' => {
                    rank -= 1;
                    file = 0;
                }
                '1'..='8' => file += c.to_digit(10).unwrap(),
                _ => {
                    let square = rank * 8 + file;

                    if !(0..64).contains(&square) {
                        return Err(Self::Error::InvalidFEN(fen.to_string()));
                    }

                    let (color, piece) = match c {
                        'P' => (Color::White, Piece::Pawn),
                        'p' => (Color::Black, Piece::Pawn),
                        'N' => (Color::White, Piece::Knight),
                        'n' => (Color::Black, Piece::Knight),
                        'B' => (Color::White, Piece::Bishop),
                        'b' => (Color::Black, Piece::Bishop),
                        'R' => (Color::White, Piece::Rook),
                        'r' => (Color::Black, Piece::Rook),
                        'Q' => (Color::White, Piece::Queen),
                        'q' => (Color::Black, Piece::Queen),
                        'K' => (Color::White, Piece::King),
                        'k' => (Color::Black, Piece::King),
                        _ => return Err(Self::Error::InvalidPieces(pieces.to_string())),
                    };

                    set_bit!(state.piece_bitboards[color][piece], square);
                    set_bit!(state.side_bitboards[color], square);

                    file += 1;
                }
            }
        }

        if state.piece_bitboards[Color::White][Piece::King].count_ones() != 1
            || state.piece_bitboards[Color::Black][Piece::King].count_ones() != 1
        {
            return Err(Self::Error::InvalidPieces(pieces.to_string()));
        }

        let first_last_mask = 0xFF000000000000FF;
        if (state.piece_bitboards[Color::White][Piece::Pawn] & first_last_mask)
            | (state.piece_bitboards[Color::Black][Piece::Pawn] & first_last_mask)
            != 0
        {
            return Err(Self::Error::InvalidPieces(pieces.to_string()));
        }

        state.occupancy = state.side_bitboards[Color::White] | state.side_bitboards[Color::Black];

        state.turn = match turn {
            "w" => Color::White,
            "b" => Color::Black,
            _ => return Err(Self::Error::InvalidTurn(turn.to_string())),
        };

        if enpassant != "-" {
            let enpassant_bytes = enpassant.as_bytes();
            if enpassant_bytes.len() != 2 {
                return Err(Self::Error::InvalidEnpassant(enpassant.to_string()));
            }

            let file = enpassant_bytes[0] - b'a';
            let rank = enpassant_bytes[1] - b'1';
            let square = file + rank * 8;

            let pawn_square = match rank {
                2 if state.turn == Color::Black => square.wrapping_add(8),
                5 if state.turn == Color::White => square.wrapping_sub(8),
                _ => {
                    return Err(Self::Error::InvalidEnpassant(enpassant.to_string()));
                }
            };

            if get_bit!(state.piece_bitboards[!state.turn][Piece::Pawn], pawn_square) != 0 {
                state.enpassant = Some(square);
            } else {
                return Err(Self::Error::InvalidEnpassant(enpassant.to_string()));
            }
        }

        for c in castling_rights.chars() {
            match c {
                'K' if get_bit!(state.piece_bitboards[Color::White][Piece::King], 4) != 0
                    && get_bit!(state.piece_bitboards[Color::White][Piece::Rook], 7) != 0 =>
                {
                    set_bit!(state.castling_rights, 0)
                }
                'Q' if get_bit!(state.piece_bitboards[Color::White][Piece::King], 4) != 0
                    && get_bit!(state.piece_bitboards[Color::White][Piece::Rook], 0) != 0 =>
                {
                    set_bit!(state.castling_rights, 1)
                }
                'k' if get_bit!(state.piece_bitboards[Color::Black][Piece::King], 60) != 0
                    && get_bit!(state.piece_bitboards[Color::Black][Piece::Rook], 63) != 0 =>
                {
                    set_bit!(state.castling_rights, 2)
                }
                'q' if get_bit!(state.piece_bitboards[Color::Black][Piece::King], 60) != 0
                    && get_bit!(state.piece_bitboards[Color::Black][Piece::Rook], 56) != 0 =>
                {
                    set_bit!(state.castling_rights, 3)
                }
                '-' => {}
                _ => {
                    return Err(Self::Error::InvalidCastlingRights(
                        castling_rights.to_string(),
                    ));
                }
            }
        }

        state.half_moves = half_moves
            .parse()
            .map_err(|_| Self::Error::InvalidHalfMoves(half_moves.to_string()))?;

        Ok(state)
    }
}

#[cfg(test)]
mod test {
    use crate::{
        fen::FENError,
        state::{Color, ColorArray, PieceArray, State},
    };

    #[test]
    fn starting_position() -> Result<(), FENError> {
        let state = State::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;

        assert_eq!(
            state.piece_bitboards,
            ColorArray::new([
                PieceArray::new([
                    0x000000000000FF00,
                    0x0000000000000042,
                    0x0000000000000024,
                    0x0000000000000081,
                    0x0000000000000008,
                    0x0000000000000010,
                ]),
                PieceArray::new([
                    0x00FF000000000000,
                    0x4200000000000000,
                    0x2400000000000000,
                    0x8100000000000000,
                    0x0800000000000000,
                    0x1000000000000000,
                ]),
            ])
        );

        assert_eq!(state.turn, Color::White);
        assert_eq!(state.side_bitboards[Color::White], 0x000000000000FFFF);
        assert_eq!(state.side_bitboards[Color::Black], 0xFFFF000000000000);
        assert_eq!(state.castling_rights, 0b00001111);
        assert_eq!(state.enpassant, None);
        assert_eq!(state.half_moves, 0);

        Ok(())
    }

    #[test]
    fn enpassant() -> Result<(), FENError> {
        let state =
            State::try_from("rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3")?;

        assert_eq!(
            state.piece_bitboards,
            ColorArray::new([
                PieceArray::new([
                    0x000000100000EF00,
                    0x0000000000000042,
                    0x0000000000000024,
                    0x0000000000000081,
                    0x0000000000000008,
                    0x0000000000000010,
                ]),
                PieceArray::new([
                    0x00F7000800000000,
                    0x4200000000000000,
                    0x2400000000000000,
                    0x8100000000000000,
                    0x0800000000000000,
                    0x1000000000000000,
                ]),
            ])
        );

        assert_eq!(state.turn, Color::White);
        assert_eq!(state.side_bitboards[Color::White], 0x000000100000EFFF);
        assert_eq!(state.side_bitboards[Color::Black], 0xFFF7000800000000);
        assert_eq!(state.castling_rights, 0b00001111);
        assert_eq!(state.enpassant, Some(43));
        assert_eq!(state.half_moves, 0);

        Ok(())
    }

    #[test]
    fn castling_rights() -> Result<(), FENError> {
        let state =
            State::try_from("r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 3")?;

        assert_eq!(
            state.piece_bitboards,
            ColorArray::new([
                PieceArray::new([
                    0x000000001000EF00,
                    0x0000000000200002,
                    0x0000000004000004,
                    0x0000000000000021,
                    0x0000000000000008,
                    0x0000000000000040,
                ]),
                PieceArray::new([
                    0x00EF001000000000,
                    0x0000240000000000,
                    0x2400000000000000,
                    0x8100000000000000,
                    0x0800000000000000,
                    0x1000000000000000,
                ])
            ])
        );

        assert_eq!(state.turn, Color::Black);
        assert_eq!(state.side_bitboards[Color::White], 0x000000001420EF6F);
        assert_eq!(state.side_bitboards[Color::Black], 0xBDEF241000000000);
        assert_eq!(state.castling_rights, 0b00001100);
        assert_eq!(state.enpassant, None);
        assert_eq!(state.half_moves, 5);

        Ok(())
    }
}
