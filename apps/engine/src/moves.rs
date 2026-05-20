use crate::board::Piece;

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Default)]
pub enum PromotionPiece {
    #[default]
    Queen = 0b00,
    Rook = 0b01,
    Bishop = 0b10,
    Knight = 0b11,
}

#[derive(Copy, Clone, Default)]
pub struct MoveData {
    pub source: u32,
    pub target: u32,
    pub piece: Piece,
    pub promoted: PromotionPiece,
    pub capture: bool,
    pub double: bool,
    pub enpassant: bool,
    pub castling: bool,
}

pub struct Move(u32);

impl Move {
    pub fn new(data: MoveData) -> Self {
        Move(
            data.source
                | (data.target << 6)
                | ((data.piece as u32) << 12)
                | ((data.promoted as u32) << 15)
                | (data.capture as u32) << 17
                | ((data.double as u32) << 18)
                | ((data.enpassant as u32) << 19)
                | ((data.castling as u32) << 20),
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
    pub fn promoted(self) -> PromotionPiece {
        unsafe { std::mem::transmute(((self.0 >> 15) & 0b11) as u8) }
    }

    #[inline]
    pub fn is_capture(self) -> bool {
        ((self.0 >> 17) & 1) != 0
    }

    #[inline]
    pub fn is_double_pawn_push(self) -> bool {
        ((self.0 >> 18) & 1) != 0
    }

    #[inline]
    pub fn is_enpassant(self) -> bool {
        ((self.0 >> 19) & 1) != 0
    }

    #[inline]
    pub fn is_castling(self) -> bool {
        ((self.0 >> 20) & 1) != 0
    }
}
