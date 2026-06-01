use crate::{
    attacks::{BLACK_PAWN_ATTACKS, WHITE_PAWN_ATTACKS},
    bitboard::BitboardOperations,
    position::{Position, movegen::unmake::MoveUndo},
    types::{Color, Move, Piece},
};

impl Position {
    pub fn make_move(&mut self, mv: Move) -> MoveUndo {
        let undo = MoveUndo {
            castling_rights: self.castling_rights,
            enpassant: self.enpassant,
            half_moves: self.half_moves,
        };

        self.half_moves += 1;
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

        pop_piece!(self.turn, source_piece, source);

        if let Some(capture) = mv.capture() {
            self.half_moves = 0;
            pop_piece!(!self.turn, capture, target);
            if capture == Piece::Rook {
                self.zobrist_key
                    .toggle_castling_rights(self.castling_rights);
                match target {
                    7 => self.castling_rights &= 0b11111110,
                    0 => self.castling_rights &= 0b11111101,
                    63 => self.castling_rights &= 0b11111011,
                    56 => self.castling_rights &= 0b11110111,
                    _ => {}
                }
                self.zobrist_key
                    .toggle_castling_rights(self.castling_rights);
            }
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
            pop_piece!(!self.turn, Piece::Pawn, square_behind);
        }

        if let Some(enpassant) = self.enpassant {
            self.zobrist_key.toggle_enpassant(enpassant);
        }

        self.enpassant = if mv.is_double_pawn_push()
            && match self.turn {
                Color::White => {
                    WHITE_PAWN_ATTACKS[square_behind as usize]
                        & self.piece_bitboards[Color::Black][Piece::Pawn]
                        != 0
                }
                Color::Black => {
                    BLACK_PAWN_ATTACKS[square_behind as usize]
                        & self.piece_bitboards[Color::White][Piece::Pawn]
                        != 0
                }
            } {
            self.zobrist_key.toggle_enpassant(square_behind as u8);
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
            self.zobrist_key
                .toggle_castling_rights(self.castling_rights);
            match self.turn {
                Color::White => {
                    self.castling_rights &= 0b11111110;
                    self.castling_rights &= 0b11111101;
                }
                Color::Black => {
                    self.castling_rights &= 0b11111011;
                    self.castling_rights &= 0b11110111;
                }
            }
            self.zobrist_key
                .toggle_castling_rights(self.castling_rights);
        } else if source_piece == Piece::Rook {
            self.zobrist_key
                .toggle_castling_rights(self.castling_rights);
            match source {
                7 => self.castling_rights &= 0b11111110,
                0 => self.castling_rights &= 0b11111101,
                63 => self.castling_rights &= 0b11111011,
                56 => self.castling_rights &= 0b11110111,
                _ => {}
            }
            self.zobrist_key
                .toggle_castling_rights(self.castling_rights);
        }

        self.occupancy = self.side_bitboards[self.turn] | self.side_bitboards[!self.turn];
        self.turn = !self.turn;
        self.zobrist_key.toggle_turn();

        self.history.push(self.zobrist_key.value());

        undo
    }
}
