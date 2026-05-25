use crate::{
    get_ls1b_index, pop_bit,
    position::Position,
    set_bit,
    types::{Color, Move, Piece},
};

#[derive(Copy, Clone)]
pub struct MoveUndo {
    pub castling_rights: u8,
    pub enpassant: Option<u8>,
    pub half_moves: u16,
}

impl Position {
    pub fn make_move(&mut self, mv: Move) -> MoveUndo {
        let undo = MoveUndo {
            castling_rights: self.castling_rights,
            enpassant: self.enpassant,
            half_moves: self.half_moves,
        };

        self.half_moves += 1;
        let opp_color = !self.turn;
        let source = mv.source();
        let source_piece = mv.piece();
        let target = mv.target();

        macro_rules! set_piece {
            ($color:expr, $piece:expr, $square:expr) => {{
                set_bit!(self.piece_bitboards[$color][$piece], $square);
                set_bit!(self.side_bitboards[$color], $square);
            }};
        }

        macro_rules! pop_piece {
            ($color:expr, $piece:expr, $square:expr) => {{
                pop_bit!(self.piece_bitboards[$color][$piece], $square);
                pop_bit!(self.side_bitboards[$color], $square);
            }};
        }

        pop_piece!(self.turn, source_piece, source);

        if let Some(capture) = mv.capture() {
            self.half_moves = 0;
            pop_piece!(opp_color, capture, target);
        }

        if source_piece == Piece::Pawn {
            self.half_moves = 0;
        }

        if let Some(promoted) = mv.promotion() {
            let piece = unsafe { std::mem::transmute::<u8, Piece>(promoted as u8) };
            set_piece!(self.turn, piece, target);
        } else {
            set_piece!(self.turn, source_piece, target);
        }

        let square_behind = match self.turn {
            Color::White => target.wrapping_sub(8),
            Color::Black => target.wrapping_add(8),
        };

        if mv.is_enpassant() {
            pop_piece!(opp_color, Piece::Pawn, square_behind);
        }

        self.enpassant = if mv.is_double_pawn_push() {
            Some(square_behind as u8)
        } else {
            None
        };

        if mv.is_castling() {
            match target {
                6 => {
                    pop_piece!(self.turn, Piece::Rook, 7);
                    set_piece!(self.turn, Piece::Rook, 5);
                }
                2 => {
                    pop_piece!(self.turn, Piece::Rook, 0);
                    set_piece!(self.turn, Piece::Rook, 3);
                }
                62 => {
                    pop_piece!(self.turn, Piece::Rook, 63);
                    set_piece!(self.turn, Piece::Rook, 61);
                }
                58 => {
                    pop_piece!(self.turn, Piece::Rook, 56);
                    set_piece!(self.turn, Piece::Rook, 59);
                }
                _ => unreachable!(),
            }
        }

        if mv.is_castling() || source_piece == Piece::King {
            match self.turn {
                Color::White => {
                    pop_bit!(self.castling_rights, 0);
                    pop_bit!(self.castling_rights, 1);
                }
                Color::Black => {
                    pop_bit!(self.castling_rights, 2);
                    pop_bit!(self.castling_rights, 3);
                }
            }
        } else if source_piece == Piece::Rook {
            match source {
                7 => pop_bit!(self.castling_rights, 0),
                0 => pop_bit!(self.castling_rights, 1),
                63 => pop_bit!(self.castling_rights, 2),
                56 => pop_bit!(self.castling_rights, 3),
                _ => {}
            }
        }

        self.occupancy = self.side_bitboards[self.turn] | self.side_bitboards[opp_color];
        self.turn = opp_color;

        undo
    }

    pub fn undo_move(&mut self, mv: Move, undo: MoveUndo) {
        self.turn = !self.turn;
        let opp_color = !self.turn;

        let source = mv.source();
        let source_piece = mv.piece();
        let target = mv.target();

        macro_rules! set_piece {
            ($color:expr, $piece:expr, $square:expr) => {{
                set_bit!(self.piece_bitboards[$color][$piece], $square);
                set_bit!(self.side_bitboards[$color], $square);
            }};
        }

        macro_rules! pop_piece {
            ($color:expr, $piece:expr, $square:expr) => {{
                pop_bit!(self.piece_bitboards[$color][$piece], $square);
                pop_bit!(self.side_bitboards[$color], $square);
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
            set_piece!(opp_color, capture, target);
        }

        let square_behind = match self.turn {
            Color::White => target.wrapping_sub(8),
            Color::Black => target.wrapping_add(8),
        };

        if mv.is_enpassant() {
            set_piece!(opp_color, Piece::Pawn, square_behind);
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

        self.castling_rights = undo.castling_rights;
        self.enpassant = undo.enpassant;
        self.half_moves = undo.half_moves;
        self.occupancy = self.side_bitboards[self.turn] | self.side_bitboards[opp_color];
    }

    pub fn in_check(&self, color: Color) -> bool {
        self.is_square_attacked(
            get_ls1b_index!(self.piece_bitboards[color][Piece::King]) as usize,
            !color,
        )
    }
}
