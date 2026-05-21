use std::ops::{Index, IndexMut, Not};

use thiserror::Error;

use crate::set_bit;

#[derive(Debug, Error)]
pub enum BoardError {
    #[error("invalid fen: {0}")]
    InvalidFEN(String),
}

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
pub struct PieceBitboardArray([u64; 6]);

impl Index<Piece> for PieceBitboardArray {
    type Output = u64;

    fn index(&self, piece: Piece) -> &Self::Output {
        &self.0[piece as usize]
    }
}

impl IndexMut<Piece> for PieceBitboardArray {
    fn index_mut(&mut self, piece: Piece) -> &mut Self::Output {
        &mut self.0[piece as usize]
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

#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Board {
    pub turn: Color,
    pub castling_rights: u8,
    pub enpassant: Option<u8>,
    pub half_moves: u16,
    pub occupancy: u64,
    pub side_bitboards: ColorArray<u64>,
    pub piece_bitboards: ColorArray<PieceBitboardArray>,
}

impl TryFrom<&str> for Board {
    type Error = BoardError;

    fn try_from(fen: &str) -> Result<Self, Self::Error> {
        let [
            pieces,
            side_to_move,
            castling_rights,
            enpassant,
            half_moves,
            _full_moves,
        ]: [&str; 6] = fen
            .split(' ')
            .collect::<Vec<_>>()
            .try_into()
            .map_err(|_| Self::Error::InvalidFEN(fen.to_string()))?;

        let mut board = Self::default();

        let mut rank = 7;
        let mut file = 0;
        for c in pieces.chars() {
            match c {
                '/' => {
                    rank -= 1;
                    file = 0;
                }
                '1'..='8' => file += c.to_digit(10).unwrap(),
                _ => {
                    let square = rank * 8 + file;

                    if !(0..=64).contains(&square) {
                        return Err(Self::Error::InvalidFEN(fen.to_string()));
                    }

                    let piece_bitboard_array: &mut PieceBitboardArray = if c.is_uppercase() {
                        set_bit!(board.side_bitboards[Color::White], square);
                        &mut board.piece_bitboards[Color::White]
                    } else {
                        set_bit!(board.side_bitboards[Color::Black], square);
                        &mut board.piece_bitboards[Color::Black]
                    };

                    match c {
                        'P' | 'p' => set_bit!(piece_bitboard_array[Piece::Pawn], square),
                        'N' | 'n' => set_bit!(piece_bitboard_array[Piece::Knight], square),
                        'B' | 'b' => set_bit!(piece_bitboard_array[Piece::Bishop], square),
                        'R' | 'r' => set_bit!(piece_bitboard_array[Piece::Rook], square),
                        'Q' | 'q' => set_bit!(piece_bitboard_array[Piece::Queen], square),
                        'K' | 'k' => set_bit!(piece_bitboard_array[Piece::King], square),
                        _ => return Err(Self::Error::InvalidFEN(fen.to_string())),
                    }

                    file += 1;
                }
            }
        }

        board.occupancy = board.side_bitboards[Color::White] | board.side_bitboards[Color::Black];

        board.turn = match side_to_move {
            "w" => Color::White,
            "b" => Color::Black,
            _ => return Err(Self::Error::InvalidFEN(fen.to_string())),
        };

        if enpassant != "-" {
            let enpassant = enpassant.as_bytes();
            if enpassant.len() != 2 {
                return Err(Self::Error::InvalidFEN(fen.to_string()));
            }

            board.enpassant = Some((enpassant[0] - b'a') + (enpassant[1] - b'1') * 8);
        }

        for c in castling_rights.chars() {
            match c {
                'K' => set_bit!(board.castling_rights, 0),
                'Q' => set_bit!(board.castling_rights, 1),
                'k' => set_bit!(board.castling_rights, 2),
                'q' => set_bit!(board.castling_rights, 3),
                '-' => {}
                _ => return Err(Self::Error::InvalidFEN(fen.to_string())),
            }
        }

        board.half_moves = half_moves
            .parse()
            .map_err(|_| Self::Error::InvalidFEN(fen.to_string()))?;

        Ok(board)
    }
}

#[cfg(test)]
mod test {
    use crate::board::{Board, BoardError, Color, Piece};

    #[test]
    fn starting_position() -> Result<(), BoardError> {
        let board = Board::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Pawn],
            0x000000000000FF00
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Knight],
            0x0000000000000042
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Bishop],
            0x0000000000000024
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Rook],
            0x0000000000000081
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Queen],
            0x0000000000000008
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::King],
            0x0000000000000010
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Pawn],
            0x00FF000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Knight],
            0x4200000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Bishop],
            0x2400000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Rook],
            0x8100000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Queen],
            0x0800000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::King],
            0x1000000000000000
        );
        assert_eq!(board.side_bitboards[Color::White], 0x000000000000FFFF);
        assert_eq!(board.side_bitboards[Color::Black], 0xFFFF000000000000);
        assert_eq!(board.castling_rights, 0b00001111);
        assert_eq!(board.enpassant, None);
        assert_eq!(board.half_moves, 0);

        Ok(())
    }

    #[test]
    fn enpassant() -> Result<(), BoardError> {
        let board =
            Board::try_from("rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 3")?;
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Pawn],
            0x000000100000EF00
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Knight],
            0x0000000000000042
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Bishop],
            0x0000000000000024
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Rook],
            0x0000000000000081
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Queen],
            0x0000000000000008
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::King],
            0x0000000000000010
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Pawn],
            0x00F7000800000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Knight],
            0x4200000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Bishop],
            0x2400000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Rook],
            0x8100000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Queen],
            0x0800000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::King],
            0x1000000000000000
        );
        assert_eq!(board.side_bitboards[Color::White], 0x000000100000EFFF);
        assert_eq!(board.side_bitboards[Color::Black], 0xFFF7000800000000);
        assert_eq!(board.castling_rights, 0b00001111);
        assert_eq!(board.enpassant, Some(20));
        assert_eq!(board.half_moves, 0);
        Ok(())
    }

    #[test]
    fn castling_rights() -> Result<(), BoardError> {
        let board =
            Board::try_from("r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 3")?;
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Pawn],
            0x000000001000EF00
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Knight],
            0x0000000000200002
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Bishop],
            0x0000000004000004
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Rook],
            0x0000000000000021
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::Queen],
            0x0000000000000008
        );
        assert_eq!(
            board.piece_bitboards[Color::White][Piece::King],
            0x0000000000000040
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Pawn],
            0x00EF001000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Knight],
            0x0000240000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Bishop],
            0x2400000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Rook],
            0x8100000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::Queen],
            0x0800000000000000
        );
        assert_eq!(
            board.piece_bitboards[Color::Black][Piece::King],
            0x1000000000000000
        );
        assert_eq!(board.side_bitboards[Color::White], 0x000000001420EF6F);
        assert_eq!(board.side_bitboards[Color::Black], 0xBDEF241000000000);
        assert_eq!(board.castling_rights, 0b00001100);
        assert_eq!(board.enpassant, None);
        assert_eq!(board.half_moves, 5);
        Ok(())
    }
}
