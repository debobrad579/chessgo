use std::fmt::Display;

use arrayvec::ArrayVec;

use crate::{
    get_bit, get_ls1b_index, pop_bit, set_bit,
    state::{Color, Piece, State},
};

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Default, Debug)]
pub enum PromotionPiece {
    #[default]
    Queen = 0b100,
    Rook = 0b011,
    Bishop = 0b010,
    Knight = 0b001,
}

impl PromotionPiece {
    pub const ALL: [Self; 4] = [Self::Queen, Self::Rook, Self::Bishop, Self::Knight];

    pub fn iter() -> impl Iterator<Item = Self> {
        Self::ALL.into_iter()
    }
}

#[derive(Debug, Clone, Copy)]
pub struct Move(u32);

impl Display for Move {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let file = (b'a' + ((self.source() as u8) % 8)) as char;
        let rank = (self.source() / 8) + 1;
        let target_file = (b'a' + ((self.target() as u8) % 8)) as char;
        let target_rank = ((self.target() as u8) / 8) + 1;
        let promotion = match self.promotion() {
            Some(PromotionPiece::Queen) => "q",
            Some(PromotionPiece::Rook) => "r",
            Some(PromotionPiece::Bishop) => "b",
            Some(PromotionPiece::Knight) => "n",
            None => "",
        };

        write!(
            f,
            "{}{}{}{}{}",
            file, rank, target_file, target_rank, promotion
        )
    }
}

impl Move {
    #[allow(clippy::too_many_arguments)]
    #[inline(always)]
    pub fn new(
        source: u32,
        target: u32,
        piece: Piece,
        promotion: Option<PromotionPiece>,
        capture: bool,
        double: bool,
        enpassant: bool,
        castling: bool,
    ) -> Self {
        Move(
            source
                | (target << 6)
                | ((piece as u32) << 12)
                | ((promotion.map(|p| p as u32).unwrap_or(0b000)) << 15)
                | (capture as u32) << 18
                | ((double as u32) << 19)
                | ((enpassant as u32) << 20)
                | ((castling as u32) << 21),
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
    pub fn promotion(self) -> Option<PromotionPiece> {
        match ((self.0 >> 15) & 0b111) as u8 {
            0b000 => None,
            0b100 => Some(PromotionPiece::Queen),
            0b011 => Some(PromotionPiece::Rook),
            0b010 => Some(PromotionPiece::Bishop),
            0b001 => Some(PromotionPiece::Knight),
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

impl State {
    pub fn make_move(&mut self, mv: Move) {
        let opp_color = !self.turn;
        let source = mv.source();
        let source_piece = mv.piece();
        let target = mv.target();

        pop_bit!(self.piece_bitboards[self.turn][source_piece], source);
        pop_bit!(self.side_bitboards[self.turn], source);

        if let Some(promoted) = mv.promotion() {
            let piece = unsafe { std::mem::transmute::<u8, Piece>(promoted as u8) };
            set_bit!(self.piece_bitboards[self.turn][piece], target);
        } else {
            set_bit!(self.piece_bitboards[self.turn][source_piece], target);
        }
        set_bit!(self.side_bitboards[self.turn], target);

        if mv.is_capture() {
            for target_piece in Piece::iter() {
                if get_bit!(self.piece_bitboards[opp_color][target_piece], target) != 0 {
                    pop_bit!(self.piece_bitboards[opp_color][target_piece], target);
                    pop_bit!(self.side_bitboards[opp_color], target);
                    break;
                }
            }
        }

        if mv.is_castling() {
            match target {
                6 => {
                    pop_bit!(self.piece_bitboards[self.turn][Piece::Rook], 7);
                    pop_bit!(self.side_bitboards[self.turn], 7);
                    set_bit!(self.piece_bitboards[self.turn][Piece::Rook], 5);
                    set_bit!(self.side_bitboards[self.turn], 5);
                }
                2 => {
                    pop_bit!(self.piece_bitboards[self.turn][Piece::Rook], 0);
                    pop_bit!(self.side_bitboards[self.turn], 0);
                    set_bit!(self.piece_bitboards[self.turn][Piece::Rook], 3);
                    set_bit!(self.side_bitboards[self.turn], 3);
                }
                62 => {
                    pop_bit!(self.piece_bitboards[self.turn][Piece::Rook], 63);
                    pop_bit!(self.side_bitboards[self.turn], 63);
                    set_bit!(self.piece_bitboards[self.turn][Piece::Rook], 61);
                    set_bit!(self.side_bitboards[self.turn], 61);
                }
                58 => {
                    pop_bit!(self.piece_bitboards[self.turn][Piece::Rook], 56);
                    pop_bit!(self.side_bitboards[self.turn], 56);
                    set_bit!(self.piece_bitboards[self.turn][Piece::Rook], 59);
                    set_bit!(self.side_bitboards[self.turn], 59);
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

        let square_behind = match self.turn {
            Color::White => target.wrapping_sub(8),
            Color::Black => target.wrapping_add(8),
        };

        if mv.is_enpassant() {
            pop_bit!(self.piece_bitboards[opp_color][Piece::Pawn], square_behind);
            pop_bit!(self.side_bitboards[opp_color], square_behind);
        }

        self.enpassant = if mv.is_double_pawn_push() {
            Some(square_behind as u8)
        } else {
            None
        };

        self.occupancy = self.side_bitboards[self.turn] | self.side_bitboards[opp_color];
        self.turn = opp_color;
    }

    pub fn get_legal_moves(&self) -> ArrayVec<Move, 256> {
        let source_king_square = get_ls1b_index!(self.piece_bitboards[self.turn][Piece::King]);

        self.generate_pseudolegal_moves(self.turn)
            .into_iter()
            .filter(|mv| {
                let mut new_board = *self;
                new_board.make_move(*mv);
                let king_square = if mv.piece() == Piece::King {
                    mv.target()
                } else {
                    source_king_square
                };
                !new_board.is_square_attacked(king_square as usize, !self.turn)
            })
            .collect()
    }

    pub fn get_legal_captures(&self) -> ArrayVec<Move, 256> {
        let source_king_square = get_ls1b_index!(self.piece_bitboards[self.turn][Piece::King]);

        self.generate_pseudolegal_captures(self.turn)
            .into_iter()
            .filter(|mv| {
                let mut new_board = *self;
                new_board.make_move(*mv);
                let king_square = if mv.piece() == Piece::King {
                    mv.target()
                } else {
                    source_king_square
                };
                !new_board.is_square_attacked(king_square as usize, !self.turn)
            })
            .collect()
    }

    pub fn in_check(&self, color: Color) -> bool {
        self.is_square_attacked(
            get_ls1b_index!(self.piece_bitboards[color][Piece::King]) as usize,
            color,
        )
    }
}
