use crate::{
    board::{Board, Color, Piece},
    get_bit, get_ls1b_index, pop_bit, set_bit,
};

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Default)]
pub enum PromotionPiece {
    #[default]
    Queen = 0b100,
    Rook = 0b101,
    Bishop = 0b110,
    Knight = 0b111,
}

#[derive(Copy, Clone, Default)]
pub struct MoveData {
    pub source: u32,
    pub target: u32,
    pub piece: Piece,
    pub promoted: Option<PromotionPiece>,
    pub capture: bool,
    pub double: bool,
    pub enpassant: bool,
    pub castling: bool,
}

#[derive(Debug, Clone, Copy)]
pub struct Move(u32);

impl Move {
    pub fn new(data: MoveData) -> Self {
        Move(
            data.source
                | (data.target << 6)
                | ((data.piece as u32) << 12)
                | ((data.promoted.map(|p| p as u32).unwrap_or(0b000)) << 15)
                | (data.capture as u32) << 18
                | ((data.double as u32) << 19)
                | ((data.enpassant as u32) << 20)
                | ((data.castling as u32) << 21),
        )
    }

    #[inline]
    pub fn raw(self) -> u32 {
        self.0
    }

    #[inline]
    pub fn source(self) -> u32 {
        self.0 & 0x3F
    }

    #[inline]
    pub fn target(self) -> u32 {
        (self.0 & 0xFC0) >> 6
    }

    #[inline]
    pub fn piece(self) -> Piece {
        unsafe { std::mem::transmute(((self.0 >> 12) & 0b111) as u8) }
    }

    #[inline]
    pub fn promoted(self) -> Option<PromotionPiece> {
        match ((self.0 >> 15) & 0b111) as u8 {
            0b000 => None,
            0b100 => Some(PromotionPiece::Queen),
            0b101 => Some(PromotionPiece::Rook),
            0b110 => Some(PromotionPiece::Bishop),
            0b111 => Some(PromotionPiece::Knight),
            _ => unreachable!(),
        }
    }

    #[inline]
    pub fn is_capture(self) -> bool {
        ((self.0 >> 18) & 1) != 0
    }

    #[inline]
    pub fn is_double_pawn_push(self) -> bool {
        ((self.0 >> 19) & 1) != 0
    }

    #[inline]
    pub fn is_enpassant(self) -> bool {
        ((self.0 >> 20) & 1) != 0
    }

    #[inline]
    pub fn is_castling(self) -> bool {
        ((self.0 >> 21) & 1) != 0
    }
}

impl Board {
    pub fn make_move(&mut self, m: Move) {
        let color = self.color_to_move();
        let source = m.source();
        let source_piece = m.piece();
        let target = m.target();

        pop_bit!(self.piece_bitboards[color][source_piece], source);

        if let Some(promoted) = m.promoted() {
            match promoted {
                PromotionPiece::Queen => {
                    set_bit!(self.piece_bitboards[color][Piece::Queen], target);
                }
                PromotionPiece::Rook => {
                    set_bit!(self.piece_bitboards[color][Piece::Rook], target);
                }
                PromotionPiece::Bishop => {
                    set_bit!(self.piece_bitboards[color][Piece::Bishop], target);
                }
                PromotionPiece::Knight => {
                    set_bit!(self.piece_bitboards[color][Piece::Knight], target);
                }
            }
        } else {
            set_bit!(self.piece_bitboards[color][source_piece], target);
        }

        if m.is_capture() {
            for target_piece in [
                Piece::Pawn,
                Piece::Knight,
                Piece::Bishop,
                Piece::Rook,
                Piece::Queen,
            ] {
                if get_bit!(self.piece_bitboards[!color][target_piece], target) != 0 {
                    pop_bit!(self.piece_bitboards[!color][target_piece], target);
                }
            }
        }

        if m.is_castling() {
            match target {
                6 => {
                    pop_bit!(self.piece_bitboards[color][Piece::Rook], 7);
                    set_bit!(self.piece_bitboards[color][Piece::Rook], 5);
                }
                2 => {
                    pop_bit!(self.piece_bitboards[color][Piece::Rook], 0);
                    set_bit!(self.piece_bitboards[color][Piece::Rook], 3);
                }
                62 => {
                    pop_bit!(self.piece_bitboards[color][Piece::Rook], 63);
                    set_bit!(self.piece_bitboards[color][Piece::Rook], 61);
                }
                58 => {
                    pop_bit!(self.piece_bitboards[color][Piece::Rook], 56);
                    set_bit!(self.piece_bitboards[color][Piece::Rook], 59);
                }
                _ => {}
            }
        }

        if m.is_castling() || source_piece == Piece::King {
            match color {
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

        let square_behind = match color {
            Color::White => target.wrapping_sub(8),
            Color::Black => target.wrapping_add(8),
        };

        if m.is_enpassant() {
            pop_bit!(self.piece_bitboards[!color][Piece::Pawn], square_behind);
        }

        self.enpassant = if m.is_double_pawn_push() {
            Some(square_behind as u8)
        } else {
            None
        };

        self.side_bitboards[color] = self.piece_bitboards[color][Piece::Pawn]
            | self.piece_bitboards[color][Piece::Knight]
            | self.piece_bitboards[color][Piece::Bishop]
            | self.piece_bitboards[color][Piece::Rook]
            | self.piece_bitboards[color][Piece::Queen]
            | self.piece_bitboards[color][Piece::King];

        self.side_bitboards[!color] = self.piece_bitboards[!color][Piece::Pawn]
            | self.piece_bitboards[!color][Piece::Knight]
            | self.piece_bitboards[!color][Piece::Bishop]
            | self.piece_bitboards[!color][Piece::Rook]
            | self.piece_bitboards[!color][Piece::Queen]
            | self.piece_bitboards[!color][Piece::King];

        match color {
            Color::White => pop_bit!(self.castling_rights, 7),
            Color::Black => set_bit!(self.castling_rights, 7),
        };
    }

    pub fn get_legal_moves(&self) -> Vec<Move> {
        let color = self.color_to_move();
        self.generate_pseudolegal_moves(color)
            .into_iter()
            .filter(|m| {
                let mut new_board = *self;
                new_board.make_move(*m);
                !new_board.is_square_attacked(
                    get_ls1b_index!(new_board.piece_bitboards[color][Piece::King]) as usize,
                    !color,
                )
            })
            .collect()
    }
}
