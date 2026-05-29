use crate::types::{Color, ColorArray, PieceArray};

pub mod fen;

#[derive(Debug, PartialEq, Default)]
pub struct Position {
    pub turn: Color,
    pub castling_rights: u8,
    pub enpassant: Option<u8>,
    pub half_moves: u16,
    pub occupancy: u64,
    pub zobrist_key: u64,
    pub side_bitboards: ColorArray<u64>,
    pub piece_bitboards: ColorArray<PieceArray<u64>>,
}
