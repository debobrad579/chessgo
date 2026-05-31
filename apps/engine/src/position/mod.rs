use crate::types::{Color, ColorArray, Piece, PieceArray};

mod eval;
mod hash;

pub mod fen;
pub mod movegen;

#[derive(Debug, PartialEq, Default)]
pub struct Position {
    turn: Color,
    castling_rights: u8,
    enpassant: Option<u8>,
    half_moves: u16,
    zobrist_key: hash::ZobristKey,
    occupancy: u64,
    side_bitboards: ColorArray<u64>,
    piece_bitboards: ColorArray<PieceArray<u64>>,
}

impl Position {
    pub fn turn(&self) -> Color {
        self.turn
    }

    pub fn half_moves(&self) -> u16 {
        self.half_moves
    }

    pub fn zobrist_key(&self) -> u64 {
        self.zobrist_key.value()
    }

    pub fn in_check(&self, color: Color) -> bool {
        self.is_square_attacked(
            self.piece_bitboards[color][Piece::King].trailing_zeros() as usize,
            !color,
        )
    }
}
