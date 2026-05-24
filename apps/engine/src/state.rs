use std::ops::{Index, IndexMut, Not};

use crate::{moves::Move, search::MAX_PLY};

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

    pub fn iter() -> impl Iterator<Item = Self> {
        Self::ALL.into_iter()
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct ColorArray<T>([T; 2]);

impl<T> Index<Color> for ColorArray<T> {
    type Output = T;

    fn index(&self, color: Color) -> &Self::Output {
        &self.0[color as usize]
    }
}

impl<T> IndexMut<Color> for ColorArray<T> {
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

    fn index(&self, piece: Piece) -> &Self::Output {
        &self.0[piece as usize]
    }
}

impl<T> IndexMut<Piece> for PieceArray<T> {
    fn index_mut(&mut self, piece: Piece) -> &mut Self::Output {
        &mut self.0[piece as usize]
    }
}

impl<T> PieceArray<T> {
    pub const fn new(v: [T; 6]) -> Self {
        Self(v)
    }
}

#[derive(Debug, PartialEq)]
pub struct State {
    pub turn: Color,
    pub castling_rights: u8,
    pub enpassant: Option<u8>,
    pub half_moves: u16,
    pub occupancy: u64,
    pub side_bitboards: ColorArray<u64>,
    pub piece_bitboards: ColorArray<PieceArray<u64>>,
    pub killer_moves: Box<[[Option<Move>; 2]; MAX_PLY]>,
    pub history_moves: Box<ColorArray<[[u32; 64]; 64]>>,
}

impl Default for State {
    fn default() -> Self {
        Self {
            turn: Default::default(),
            castling_rights: Default::default(),
            enpassant: Default::default(),
            half_moves: Default::default(),
            occupancy: Default::default(),
            side_bitboards: Default::default(),
            piece_bitboards: Default::default(),
            killer_moves: Box::new([[None; 2]; MAX_PLY]),
            history_moves: Box::new(ColorArray::new([[[0; 64]; 64], [[0; 64]; 64]])),
        }
    }
}
