use thiserror::Error;

use crate::set_bit;

#[derive(Debug, Error)]
pub enum BoardError {
    #[error("invalid fen: {0}")]
    InvalidFEN(String),
}

#[derive(Debug, Default, PartialEq)]
pub struct Board {
    pub castling_rights: u8,
    pub enpassant: Option<u8>,
    pub half_moves: u16,

    pub white_pawns: u64,
    pub white_knights: u64,
    pub white_bishops: u64,
    pub white_rooks: u64,
    pub white_queens: u64,
    pub white_king: u64,

    pub black_pawns: u64,
    pub black_knights: u64,
    pub black_bishops: u64,
    pub black_rooks: u64,
    pub black_queens: u64,
    pub black_king: u64,

    pub white_pieces: u64,
    pub black_pieces: u64,
}

impl TryFrom<&str> for Board {
    type Error = BoardError;

    fn try_from(fen: &str) -> Result<Self, Self::Error> {
        let [
            pieces,
            color_to_move,
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

                    match c {
                        'P' => set_bit!(board.white_pawns, square),
                        'N' => set_bit!(board.white_knights, square),
                        'B' => set_bit!(board.white_bishops, square),
                        'R' => set_bit!(board.white_rooks, square),
                        'Q' => set_bit!(board.white_queens, square),
                        'K' => set_bit!(board.white_king, square),
                        'p' => set_bit!(board.black_pawns, square),
                        'n' => set_bit!(board.black_knights, square),
                        'b' => set_bit!(board.black_bishops, square),
                        'r' => set_bit!(board.black_rooks, square),
                        'q' => set_bit!(board.black_queens, square),
                        'k' => set_bit!(board.black_king, square),
                        _ => return Err(Self::Error::InvalidFEN(fen.to_string())),
                    }

                    if c.is_uppercase() {
                        set_bit!(board.white_pieces, square);
                    } else {
                        set_bit!(board.black_pieces, square);
                    }

                    file += 1;
                }
            }
        }

        if color_to_move == "w" {
            set_bit!(board.castling_rights, 7);
        } else if color_to_move != "b" {
            return Err(Self::Error::InvalidFEN(fen.to_string()));
        }

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
    use crate::board::{Board, BoardError};

    #[test]
    fn starting_position() -> Result<(), BoardError> {
        assert_eq!(
            Board::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?,
            Board {
                castling_rights: 0b10001111,
                enpassant: None,
                half_moves: 0,

                white_pawns: 0x000000000000FF00,
                white_knights: 0x0000000000000042,
                white_bishops: 0x0000000000000024,
                white_rooks: 0x0000000000000081,
                white_queens: 0x0000000000000008,
                white_king: 0x0000000000000010,

                black_pawns: 0x00FF000000000000,
                black_knights: 0x4200000000000000,
                black_bishops: 0x2400000000000000,
                black_rooks: 0x8100000000000000,
                black_queens: 0x0800000000000000,
                black_king: 0x1000000000000000,

                white_pieces: 0x000000000000FFFF,
                black_pieces: 0xFFFF000000000000,
            }
        );

        Ok(())
    }

    #[test]
    fn enpassant() -> Result<(), BoardError> {
        assert_eq!(
            Board::try_from("rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 3")?,
            Board {
                castling_rights: 0b00001111,
                enpassant: Some(20),
                half_moves: 0,

                white_pawns: 0x000000100000EF00,
                white_knights: 0x0000000000000042,
                white_bishops: 0x0000000000000024,
                white_rooks: 0x0000000000000081,
                white_queens: 0x0000000000000008,
                white_king: 0x0000000000000010,

                black_pawns: 0x00F7000800000000,
                black_knights: 0x4200000000000000,
                black_bishops: 0x2400000000000000,
                black_rooks: 0x8100000000000000,
                black_queens: 0x0800000000000000,
                black_king: 0x1000000000000000,

                white_pieces: 0x000000100000EFFF,
                black_pieces: 0xFFF7000800000000,
            }
        );

        Ok(())
    }

    #[test]
    fn castling_rights() -> Result<(), BoardError> {
        assert_eq!(
            Board::try_from("r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 3")?,
            Board {
                castling_rights: 0b00001100,
                enpassant: None,
                half_moves: 5,

                white_pawns: 0x000000001000EF00,
                white_knights: 0x0000000000200002,
                white_bishops: 0x0000000004000004,
                white_rooks: 0x0000000000000021,
                white_queens: 0x0000000000000008,
                white_king: 0x0000000000000040,

                black_pawns: 0x00EF001000000000,
                black_knights: 0x0000240000000000,
                black_bishops: 0x2400000000000000,
                black_rooks: 0x8100000000000000,
                black_queens: 0x0800000000000000,
                black_king: 0x1000000000000000,

                white_pieces: 0x000000001420EF6F,
                black_pieces: 0xBDEF241000000000,
            }
        );

        Ok(())
    }
}
