use std::{
    fmt::Display,
    ops::{Index, IndexMut, Not},
};

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Default, Debug)]
pub enum Color {
    #[default]
    White = 0,
    Black = 1,
}

impl Not for Color {
    type Output = Color;

    fn not(self) -> Color {
        match self {
            Color::White => Color::Black,
            Color::Black => Color::White,
        }
    }
}

impl Color {
    pub const ALL: [Self; 2] = [Self::White, Self::Black];

    #[inline(always)]
    pub fn iter() -> impl Iterator<Item = Self> {
        Self::ALL.into_iter()
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct ColorArray<T>([T; 2]);

impl<T> Index<Color> for ColorArray<T> {
    type Output = T;

    #[inline(always)]
    fn index(&self, color: Color) -> &Self::Output {
        &self.0[color as usize]
    }
}

impl<T> IndexMut<Color> for ColorArray<T> {
    #[inline(always)]
    fn index_mut(&mut self, color: Color) -> &mut Self::Output {
        &mut self.0[color as usize]
    }
}

impl<T> ColorArray<T> {
    pub const fn new(v: [T; 2]) -> Self {
        Self(v)
    }
}

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Default, Debug)]
pub enum Piece {
    #[default]
    Pawn = 0b000,
    Knight = 0b001,
    Bishop = 0b010,
    Rook = 0b011,
    Queen = 0b100,
    King = 0b101,
}

impl Piece {
    pub const ALL: [Self; 6] = [
        Self::Pawn,
        Self::Knight,
        Self::Bishop,
        Self::Rook,
        Self::Queen,
        Self::King,
    ];

    pub fn iter() -> impl Iterator<Item = Self> {
        Self::ALL.into_iter()
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct PieceArray<T>([T; 6]);

impl<T> Index<Piece> for PieceArray<T> {
    type Output = T;

    #[inline(always)]
    fn index(&self, piece: Piece) -> &Self::Output {
        &self.0[piece as usize]
    }
}

impl<T> IndexMut<Piece> for PieceArray<T> {
    #[inline(always)]
    fn index_mut(&mut self, piece: Piece) -> &mut Self::Output {
        &mut self.0[piece as usize]
    }
}

impl<T> PieceArray<T> {
    pub const fn new(v: [T; 6]) -> Self {
        Self(v)
    }
}

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

#[derive(Debug, Clone, Copy, PartialEq)]
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
        capture: Option<Piece>,
        double: bool,
        enpassant: bool,
        castling: bool,
    ) -> Self {
        Move(
            source
                | (target << 6)
                | ((piece as u32) << 12)
                | ((promotion.map(|p| p as u32).unwrap_or(0b000)) << 15)
                | (capture.map(|p| p as u32).unwrap_or(0b111)) << 18
                | ((double as u32) << 21)
                | ((enpassant as u32) << 22)
                | ((castling as u32) << 23),
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
    pub fn capture(self) -> Option<Piece> {
        let bin = (self.0 >> 18) & 0b111;
        if bin == 0b111 {
            None
        } else {
            Some(unsafe { std::mem::transmute::<u8, Piece>(bin as u8) })
        }
    }

    #[inline]
    pub fn is_double_pawn_push(self) -> bool {
        ((self.0 >> 21) & 1) != 0
    }

    #[inline]
    pub fn is_enpassant(self) -> bool {
        ((self.0 >> 22) & 1) != 0
    }

    #[inline]
    pub fn is_castling(self) -> bool {
        ((self.0 >> 23) & 1) != 0
    }
}
