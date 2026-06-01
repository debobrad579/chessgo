use crate::{
    position::hash::keys::{CASTLE_KEYS, ENPASSANT_KEYS, PIECE_KEYS, TURN_KEY},
    types::{Color, Piece},
};

pub mod keys;

#[derive(Clone, Copy, PartialEq, Default, Debug)]
pub struct ZobristKey(u64);

impl ZobristKey {
    pub fn value(&self) -> u64 {
        self.0
    }

    pub fn toggle_piece(&mut self, square: u32, color: Color, piece: Piece) {
        self.0 ^= PIECE_KEYS[square as usize][color as usize][piece as usize];
    }

    pub fn toggle_enpassant(&mut self, square: u8) {
        self.0 ^= ENPASSANT_KEYS[square as usize];
    }

    pub fn toggle_castling_rights(&mut self, castling_rights: u8) {
        self.0 ^= CASTLE_KEYS[castling_rights as usize];
    }

    pub fn toggle_turn(&mut self) {
        self.0 ^= TURN_KEY;
    }
}
