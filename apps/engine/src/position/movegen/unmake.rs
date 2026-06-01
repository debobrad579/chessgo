use crate::{
    bitboard::BitboardOperations,
    position::Position,
    types::{Color, Move, Piece},
};

#[derive(Copy, Clone)]
pub struct MoveUndo {
    pub castling_rights: u8,
    pub enpassant: Option<u8>,
    pub half_moves: u16,
}

impl Position {
    pub fn undo_move(&mut self, mv: Move, undo: MoveUndo) {
        self.turn = !self.turn;
        self.zobrist_key.toggle_turn();

        let source = mv.source();
        let source_piece = mv.piece();
        let target = mv.target();

        macro_rules! set_piece {
            ($color:expr, $piece:expr, $square:expr) => {{
                self.piece_bitboards[$color][$piece].set($square);
                self.side_bitboards[$color].set($square);
                self.zobrist_key.toggle_piece($square, $color, $piece)
            }};
        }

        macro_rules! pop_piece {
            ($color:expr, $piece:expr, $square:expr) => {{
                self.piece_bitboards[$color][$piece].pop($square);
                self.side_bitboards[$color].pop($square);
                self.zobrist_key.toggle_piece($square, $color, $piece)
            }};
        }

        if let Some(promoted) = mv.promotion() {
            let promo_piece = unsafe { std::mem::transmute::<u8, Piece>(promoted as u8) };
            pop_piece!(self.turn, promo_piece, target);
        } else {
            pop_piece!(self.turn, source_piece, target);
        }
        set_piece!(self.turn, source_piece, source);

        if let Some(capture) = mv.capture() {
            set_piece!(!self.turn, capture, target);
        }

        let square_behind = match self.turn {
            Color::White => target.wrapping_sub(8),
            Color::Black => target.wrapping_add(8),
        };

        if mv.is_enpassant() {
            set_piece!(!self.turn, Piece::Pawn, square_behind);
        }

        if mv.is_castling() {
            match target {
                6 => {
                    pop_piece!(self.turn, Piece::Rook, 5);
                    set_piece!(self.turn, Piece::Rook, 7);
                }
                2 => {
                    pop_piece!(self.turn, Piece::Rook, 3);
                    set_piece!(self.turn, Piece::Rook, 0);
                }
                62 => {
                    pop_piece!(self.turn, Piece::Rook, 61);
                    set_piece!(self.turn, Piece::Rook, 63);
                }
                58 => {
                    pop_piece!(self.turn, Piece::Rook, 59);
                    set_piece!(self.turn, Piece::Rook, 56);
                }
                _ => unreachable!(),
            }
        }

        self.zobrist_key
            .toggle_castling_rights(self.castling_rights);
        self.castling_rights = undo.castling_rights;
        self.zobrist_key
            .toggle_castling_rights(self.castling_rights);
        if let Some(enpassant) = self.enpassant {
            self.zobrist_key.toggle_enpassant(enpassant);
        }
        self.enpassant = undo.enpassant;
        if let Some(enpassant) = self.enpassant {
            self.zobrist_key.toggle_enpassant(enpassant);
        }
        self.half_moves = undo.half_moves;
        self.occupancy = self.side_bitboards[self.turn] | self.side_bitboards[!self.turn];

        self.history.pop();
    }
}
