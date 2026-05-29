use crate::{
    hash::keys::{CASTLE_KEYS, ENPASSANT_KEYS, PIECE_KEYS, TURN_KEY},
    position::Position,
    types::{Color, Piece},
};

impl Position {
    pub fn toggle_zobrist_piece(&mut self, square: u32, color: Color, piece: Piece) {
        self.zobrist_key ^= PIECE_KEYS[square as usize][color as usize][piece as usize];
    }

    pub fn toggle_zobrist_enpassant(&mut self, square: u8) {
        self.zobrist_key ^= ENPASSANT_KEYS[square as usize];
    }

    pub fn toggle_zobrist_castling_rights(&mut self, castling_rights: u8) {
        self.zobrist_key ^= CASTLE_KEYS[castling_rights as usize];
    }

    pub fn toggle_zobrist_turn(&mut self) {
        self.zobrist_key ^= TURN_KEY;
    }
}
