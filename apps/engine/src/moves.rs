#[repr(u8)]
#[derive(Copy, Clone, PartialEq)]
pub enum Piece {
    WhitePawn = 0,
    WhiteKnight = 1,
    WhiteBishop = 2,
    WhiteRook = 3,
    WhiteQueen = 4,
    WhiteKing = 5,
    BlackPawn = 6,
    BlackKnight = 7,
    BlackBishop = 8,
    BlackRook = 9,
    BlackQueen = 10,
    BlackKing = 11,
}

#[derive(Copy, Clone)]
pub struct MoveData {
    pub source: u32,
    pub target: u32,
    pub piece: Piece,
    pub promoted: Option<Piece>,
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
                | ((data.promoted.unwrap_or(Piece::WhitePawn) as u32) << 16)
                | (data.capture as u32) << 20
                | ((data.double as u32) << 21)
                | ((data.enpassant as u32) << 22)
                | ((data.castling as u32) << 23),
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
        unsafe { std::mem::transmute(((self.0 & 0xF000) >> 12) as u8) }
    }

    #[inline]
    pub fn promoted(self) -> Piece {
        unsafe { std::mem::transmute(((self.0 & 0xF0000) >> 16) as u8) }
    }

    #[inline]
    pub fn is_capture(self) -> bool {
        (self.0 & 0x100000) != 0
    }

    #[inline]
    pub fn is_double_pawn_push(self) -> bool {
        (self.0 & 0x200000) != 0
    }

    #[inline]
    pub fn is_enpassant(self) -> bool {
        (self.0 & 0x400000) != 0
    }

    #[inline]
    pub fn is_castling(self) -> bool {
        (self.0 & 0x800000) != 0
    }
}
