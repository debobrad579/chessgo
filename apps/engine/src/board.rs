use thiserror::Error;

#[derive(Debug, Error)]
pub enum BoardError {
    #[error("invalid fen: {0}")]
    InvalidFEN(String),
}

#[derive(Debug, Default, PartialEq)]
pub struct Board {
    w_pawn: u64,
    w_knight: u64,
    w_bishop: u64,
    w_rook: u64,
    w_queen: u64,
    w_king: u64,

    b_pawn: u64,
    b_knight: u64,
    b_bishop: u64,
    b_rook: u64,
    b_queen: u64,
    b_king: u64,

    castling_rights: u8,
    enpassant: Option<u8>,
    half_moves: u16,
}

impl TryFrom<&str> for Board {
    type Error = BoardError;

    fn try_from(fen: &str) -> Result<Self, Self::Error> {
        let [
            pieces,
            _color_to_move,
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
            let square = rank * 8 + file;

            if !(0..64).contains(&square) && c != '/' {
                return Err(Self::Error::InvalidFEN(fen.to_string()));
            }

            match c {
                'P' => board.w_pawn |= 1u64 << square,
                'N' => board.w_knight |= 1u64 << square,
                'B' => board.w_bishop |= 1u64 << square,
                'R' => board.w_rook |= 1u64 << square,
                'Q' => board.w_queen |= 1u64 << square,
                'K' => board.w_king |= 1u64 << square,
                'p' => board.b_pawn |= 1u64 << square,
                'n' => board.b_knight |= 1u64 << square,
                'b' => board.b_bishop |= 1u64 << square,
                'r' => board.b_rook |= 1u64 << square,
                'q' => board.b_queen |= 1u64 << square,
                'k' => board.b_king |= 1u64 << square,
                '/' => {
                    rank -= 1;
                    file = 0;
                }
                '1'..='8' => file += c.to_digit(10).unwrap(),
                _ => return Err(Self::Error::InvalidFEN(fen.to_string())),
            }

            if c.is_alphabetic() {
                file += 1;
            }
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
                'K' => board.castling_rights |= 1 << 0,
                'Q' => board.castling_rights |= 1 << 1,
                'k' => board.castling_rights |= 1 << 2,
                'q' => board.castling_rights |= 1 << 3,
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
                w_pawn: 0x000000000000FF00,
                w_knight: 0x0000000000000042,
                w_bishop: 0x0000000000000024,
                w_rook: 0x0000000000000081,
                w_queen: 0x0000000000000008,
                w_king: 0x0000000000000010,

                b_pawn: 0x00FF000000000000,
                b_knight: 0x4200000000000000,
                b_bishop: 0x2400000000000000,
                b_rook: 0x8100000000000000,
                b_queen: 0x0800000000000000,
                b_king: 0x1000000000000000,

                castling_rights: 0b00001111,
                enpassant: None,
                half_moves: 0,
            }
        );

        Ok(())
    }

    #[test]
    fn enpassant() -> Result<(), BoardError> {
        assert_eq!(
            Board::try_from("rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 3")?,
            Board {
                w_pawn: 0x000000100000EF00,
                w_knight: 0x0000000000000042,
                w_bishop: 0x0000000000000024,
                w_rook: 0x0000000000000081,
                w_queen: 0x0000000000000008,
                w_king: 0x0000000000000010,

                b_pawn: 0x00F7000800000000,
                b_knight: 0x4200000000000000,
                b_bishop: 0x2400000000000000,
                b_rook: 0x8100000000000000,
                b_queen: 0x0800000000000000,
                b_king: 0x1000000000000000,

                castling_rights: 0b00001111,
                enpassant: Some(20),
                half_moves: 0,
            }
        );

        Ok(())
    }

    #[test]
    fn castling_rights() -> Result<(), BoardError> {
        assert_eq!(
            Board::try_from("r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 0 3")?,
            Board {
                w_pawn: 0x000000001000EF00,
                w_knight: 0x0000000000200002,
                w_bishop: 0x0000000004000004,
                w_rook: 0x0000000000000021,
                w_queen: 0x0000000000000008,
                w_king: 0x0000000000000040,

                b_pawn: 0x00EF001000000000,
                b_knight: 0x0000240000000000,
                b_bishop: 0x2400000000000000,
                b_rook: 0x8100000000000000,
                b_queen: 0x0800000000000000,
                b_king: 0x1000000000000000,

                castling_rights: 0b00001100,
                enpassant: None,
                half_moves: 0,
            }
        );

        Ok(())
    }
}
