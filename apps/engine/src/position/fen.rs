use crate::{
    attacks::{BLACK_PAWN_ATTACKS, WHITE_PAWN_ATTACKS},
    bitboard::BitboardOperations,
    position::Position,
    types::{Color, Piece},
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

impl TryFrom<&str> for Position {
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

        let mut position = Self::default();

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

                    position.piece_bitboards[color][piece].set(square);
                    position.side_bitboards[color].set(square);
                    position.zobrist_key.toggle_piece(square, color, piece);

                    file += 1;
                }
            }
        }

        if position.piece_bitboards[Color::White][Piece::King].count_ones() != 1
            || position.piece_bitboards[Color::Black][Piece::King].count_ones() != 1
        {
            return Err(Self::Error::InvalidPieces(pieces.to_string()));
        }

        let first_last_mask = 0xFF000000000000FF;
        if (position.piece_bitboards[Color::White][Piece::Pawn] & first_last_mask)
            | (position.piece_bitboards[Color::Black][Piece::Pawn] & first_last_mask)
            != 0
        {
            return Err(Self::Error::InvalidPieces(pieces.to_string()));
        }

        position.occupancy =
            position.side_bitboards[Color::White] | position.side_bitboards[Color::Black];

        position.turn = match turn {
            "w" => Color::White,
            "b" => {
                position.zobrist_key.toggle_turn();
                Color::Black
            }
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
                2 if position.turn == Color::Black => square.wrapping_add(8),
                5 if position.turn == Color::White => square.wrapping_sub(8),
                _ => {
                    return Err(Self::Error::InvalidEnpassant(enpassant.to_string()));
                }
            };

            if position.piece_bitboards[!position.turn][Piece::Pawn].contains(pawn_square as u32) {
                if match position.turn {
                    Color::White => {
                        BLACK_PAWN_ATTACKS[square as usize]
                            & position.piece_bitboards[Color::White][Piece::Pawn]
                            != 0
                    }
                    Color::Black => {
                        WHITE_PAWN_ATTACKS[square as usize]
                            & position.piece_bitboards[Color::Black][Piece::Pawn]
                            != 0
                    }
                } {
                    position.zobrist_key.toggle_enpassant(square);
                    position.enpassant = Some(square);
                }
            } else {
                return Err(Self::Error::InvalidEnpassant(enpassant.to_string()));
            }
        }

        for c in castling_rights.chars() {
            match c {
                'K' if position.piece_bitboards[Color::White][Piece::King].contains(4)
                    && position.piece_bitboards[Color::White][Piece::Rook].contains(7) =>
                {
                    position.castling_rights |= 0b00000001;
                }
                'Q' if position.piece_bitboards[Color::White][Piece::King].contains(4)
                    && position.piece_bitboards[Color::White][Piece::Rook].contains(0) =>
                {
                    position.castling_rights |= 0b00000010;
                }
                'k' if position.piece_bitboards[Color::Black][Piece::King].contains(60)
                    && position.piece_bitboards[Color::Black][Piece::Rook].contains(63) =>
                {
                    position.castling_rights |= 0b00000100;
                }
                'q' if position.piece_bitboards[Color::Black][Piece::King].contains(60)
                    && position.piece_bitboards[Color::Black][Piece::Rook].contains(56) =>
                {
                    position.castling_rights |= 0b00001000;
                }
                '-' => {}
                _ => {
                    return Err(Self::Error::InvalidCastlingRights(
                        castling_rights.to_string(),
                    ));
                }
            }
        }

        position
            .zobrist_key
            .toggle_castling_rights(position.castling_rights);

        position.half_moves = half_moves
            .parse()
            .map_err(|_| Self::Error::InvalidHalfMoves(half_moves.to_string()))?;

        Ok(position)
    }
}

#[cfg(test)]
mod test {
    use crate::{
        position::{Position, fen::FENError},
        types::{Color, ColorArray, PieceArray},
    };

    #[test]
    fn starting_position() -> Result<(), FENError> {
        let position =
            Position::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;

        assert_eq!(
            position.piece_bitboards,
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

        assert_eq!(position.turn, Color::White);
        assert_eq!(position.side_bitboards[Color::White], 0x000000000000FFFF);
        assert_eq!(position.side_bitboards[Color::Black], 0xFFFF000000000000);
        assert_eq!(position.castling_rights, 0b00001111);
        assert_eq!(position.enpassant, None);
        assert_eq!(position.half_moves, 0);

        Ok(())
    }

    #[test]
    fn enpassant() -> Result<(), FENError> {
        let position =
            Position::try_from("rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3")?;

        assert_eq!(
            position.piece_bitboards,
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

        assert_eq!(position.turn, Color::White);
        assert_eq!(position.side_bitboards[Color::White], 0x000000100000EFFF);
        assert_eq!(position.side_bitboards[Color::Black], 0xFFF7000800000000);
        assert_eq!(position.castling_rights, 0b00001111);
        assert_eq!(position.enpassant, Some(43));
        assert_eq!(position.half_moves, 0);

        Ok(())
    }

    #[test]
    fn castling_rights() -> Result<(), FENError> {
        let position = Position::try_from(
            "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 3",
        )?;

        assert_eq!(
            position.piece_bitboards,
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

        assert_eq!(position.turn, Color::Black);
        assert_eq!(position.side_bitboards[Color::White], 0x000000001420EF6F);
        assert_eq!(position.side_bitboards[Color::Black], 0xBDEF241000000000);
        assert_eq!(position.castling_rights, 0b00001100);
        assert_eq!(position.enpassant, None);
        assert_eq!(position.half_moves, 5);

        Ok(())
    }
}
