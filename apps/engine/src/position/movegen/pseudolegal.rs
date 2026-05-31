use arrayvec::ArrayVec;

use crate::{
    attacks::{
        BLACK_PAWN_ATTACKS, KING_ATTACKS, KNIGHT_ATTACKS, WHITE_PAWN_ATTACKS, get_bishop_attacks,
        get_queen_attacks, get_rook_attacks,
    },
    bitboard::BitboardOperations,
    position::Position,
    types::{Color, Move, Piece, PromotionPiece},
};

macro_rules! get_attacks {
    (Pawn, White, $square:expr) => {
        WHITE_PAWN_ATTACKS[$square]
    };
    (Pawn, Black, $square:expr) => {
        BLACK_PAWN_ATTACKS[$square]
    };
    (Knight, $square:expr) => {
        KNIGHT_ATTACKS[$square]
    };
    (Bishop, $square:expr, $occupancy:expr) => {
        get_bishop_attacks($square, $occupancy)
    };
    (Rook, $square:expr, $occupancy:expr) => {
        get_rook_attacks($square, $occupancy)
    };
    (Queen, $square:expr, $occupancy:expr) => {
        get_queen_attacks($square, $occupancy)
    };
    (King, $square:expr) => {
        KING_ATTACKS[$square]
    };
}

impl Position {
    #[inline(always)]
    pub fn is_square_attacked(&self, square: usize, color: Color) -> bool {
        (match color {
            Color::White => get_attacks!(Pawn, Black, square),
            Color::Black => get_attacks!(Pawn, White, square),
        }) & self.piece_bitboards[color][Piece::Pawn]
            != 0
            || get_attacks!(Knight, square) & self.piece_bitboards[color][Piece::Knight] != 0
            || get_attacks!(King, square) & self.piece_bitboards[color][Piece::King] != 0
            || get_attacks!(Bishop, square, self.occupancy)
                & (self.piece_bitboards[color][Piece::Bishop]
                    | self.piece_bitboards[color][Piece::Queen])
                != 0
            || get_attacks!(Rook, square, self.occupancy)
                & (self.piece_bitboards[color][Piece::Rook]
                    | self.piece_bitboards[color][Piece::Queen])
                != 0
    }

    #[inline(always)]
    pub fn get_target_piece(&self, square: u32) -> Option<Piece> {
        Piece::iter().find(|&piece| self.piece_bitboards[!self.turn][piece].contains(square))
    }

    pub fn generate_pseudolegal_moves(&self) -> ArrayVec<Move, 256> {
        let own = self.side_bitboards[self.turn];
        let opp = self.side_bitboards[!self.turn];
        let (pawn_attacks, pawn_offset, second_rank, last_rank, castling_source, castling_bit) =
            match self.turn {
                Color::White => (&WHITE_PAWN_ATTACKS, 8, 8..16, 56..64, 4, 0),
                Color::Black => (&BLACK_PAWN_ATTACKS, -8, 48..56, 0..8, 60, 2),
            };
        let mut moves = ArrayVec::<Move, 256>::new();

        self.piece_bitboards[self.turn][Piece::Pawn].foreach(|source| {
            macro_rules! gen_promotions {
                ($target:expr, $capture:expr) => {{
                    for piece in PromotionPiece::iter() {
                        moves.push(Move::new(
                            source,
                            $target,
                            Piece::Pawn,
                            Some(piece),
                            $capture,
                            false,
                            false,
                            false,
                        ));
                    }
                }};
            }

            let target = ((source as i32) + pawn_offset) as u32;

            if !self.occupancy.contains(target) {
                if last_rank.contains(&target) {
                    gen_promotions!(target, None);
                } else {
                    moves.push(Move::new(
                        source,
                        target,
                        Piece::Pawn,
                        None,
                        None,
                        false,
                        false,
                        false,
                    ));
                }

                if second_rank.contains(&source) {
                    let double_target = ((source as i32) + pawn_offset * 2) as u32;

                    if !self.occupancy.contains(double_target) {
                        moves.push(Move::new(
                            source,
                            double_target,
                            Piece::Pawn,
                            None,
                            None,
                            true,
                            false,
                            false,
                        ));
                    }
                }
            }

            pawn_attacks[source as usize].foreach(|target| {
                if opp.contains(target) {
                    if last_rank.contains(&target) {
                        gen_promotions!(target, self.get_target_piece(target));
                    } else {
                        moves.push(Move::new(
                            source,
                            target,
                            Piece::Pawn,
                            None,
                            self.get_target_piece(target),
                            false,
                            false,
                            false,
                        ));
                    }
                } else if self.enpassant == Some(target as u8) {
                    moves.push(Move::new(
                        source,
                        target,
                        Piece::Pawn,
                        None,
                        None,
                        false,
                        true,
                        false,
                    ));
                }
            });
        });

        macro_rules! gen_moves {
            ($piece:ident $(, $occ:expr)?) => {{
                self.piece_bitboards[self.turn][Piece::$piece].foreach(|source| {
                    (get_attacks!(
                        $piece,
                        source as usize
                        $(, $occ )?
                    ) & !own).foreach(|target| {
                        let is_capture = self.side_bitboards[!self.turn].contains(target);

                        moves.push(Move::new(
                            source,
                            target,
                            Piece::$piece,
                            None,
                            if is_capture { self.get_target_piece(target) } else { None },
                            false,
                            false,
                            false,
                        ));
                    });
                });
            }};
        }

        gen_moves!(Knight);
        gen_moves!(Bishop, self.occupancy);
        gen_moves!(Rook, self.occupancy);
        gen_moves!(Queen, self.occupancy);
        gen_moves!(King);

        if self.castling_rights & (1 << castling_bit) != 0
            && !self.occupancy.contains(castling_source + 1)
            && !self.occupancy.contains(castling_source + 2)
            && !self.is_square_attacked(castling_source as usize, !self.turn)
            && !self.is_square_attacked(castling_source as usize + 1, !self.turn)
        {
            moves.push(Move::new(
                castling_source,
                castling_source + 2,
                Piece::King,
                None,
                None,
                false,
                false,
                true,
            ));
        }

        if self.castling_rights & (1 << (castling_bit + 1)) != 0
            && !self.occupancy.contains(castling_source - 1)
            && !self.occupancy.contains(castling_source - 2)
            && !self.occupancy.contains(castling_source - 3)
            && !self.is_square_attacked(castling_source as usize, !self.turn)
            && !self.is_square_attacked(castling_source as usize - 1, !self.turn)
        {
            moves.push(Move::new(
                castling_source,
                castling_source - 2,
                Piece::King,
                None,
                None,
                false,
                false,
                true,
            ));
        }

        return moves;
    }

    pub fn generate_pseudolegal_captures(&self) -> ArrayVec<Move, 256> {
        let opp = self.side_bitboards[!self.turn];
        let (pawn_attacks, last_rank) = match self.turn {
            Color::White => (&WHITE_PAWN_ATTACKS, 56..64),
            Color::Black => (&BLACK_PAWN_ATTACKS, 0..8),
        };
        let mut moves = ArrayVec::<Move, 256>::new();

        self.piece_bitboards[self.turn][Piece::Pawn].foreach(|source| {
            pawn_attacks[source as usize].foreach(|target| {
                if opp.contains(target) {
                    if last_rank.contains(&target) {
                        for piece in PromotionPiece::iter() {
                            moves.push(Move::new(
                                source,
                                target,
                                Piece::Pawn,
                                Some(piece),
                                self.get_target_piece(target),
                                false,
                                false,
                                false,
                            ));
                        }
                    } else {
                        moves.push(Move::new(
                            source,
                            target,
                            Piece::Pawn,
                            None,
                            self.get_target_piece(target),
                            false,
                            false,
                            false,
                        ));
                    }
                } else if self.enpassant == Some(target as u8) {
                    moves.push(Move::new(
                        source,
                        target,
                        Piece::Pawn,
                        None,
                        None,
                        false,
                        true,
                        false,
                    ));
                }
            });
        });

        macro_rules! gen_moves {
            ($piece:ident $(, $occ:expr)?) => {{
                self.piece_bitboards[self.turn][Piece::$piece].foreach(|source| {
                    (get_attacks!(
                        $piece,
                        source as usize
                        $(, $occ )?
                    ) & opp).foreach(|target| {
                        moves.push(Move::new(
                            source,
                            target,
                            Piece::$piece,
                            None,
                            self.get_target_piece(target),
                            false,
                            false,
                            false,
                        ));
                    })
                });
            }};
        }

        gen_moves!(Knight);
        gen_moves!(Bishop, self.occupancy);
        gen_moves!(Rook, self.occupancy);
        gen_moves!(Queen, self.occupancy);
        gen_moves!(King);

        return moves;
    }
}

#[cfg(test)]
mod test {
    use crate::{position::Position, position::fen::FENError, position::movegen::perft};

    #[test]
    fn perft_startpos() -> Result<(), FENError> {
        let position =
            &mut Position::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;

        assert_eq!(perft(position, 1), 20);
        assert_eq!(perft(position, 2), 400);
        assert_eq!(perft(position, 3), 8_902);
        assert_eq!(perft(position, 4), 197_281);

        Ok(())
    }

    #[test]
    fn perft_kiwipete() -> Result<(), FENError> {
        let position = &mut Position::try_from(
            "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
        )?;

        assert_eq!(perft(position, 1), 48);
        assert_eq!(perft(position, 2), 2_039);
        assert_eq!(perft(position, 3), 97_862);

        Ok(())
    }

    #[test]
    fn perft_pos_3() -> Result<(), FENError> {
        let position = &mut Position::try_from("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1")?;

        assert_eq!(perft(position, 1), 14);
        assert_eq!(perft(position, 2), 191);
        assert_eq!(perft(position, 3), 2_812);
        assert_eq!(perft(position, 4), 43_238);
        assert_eq!(perft(position, 5), 674_624);

        Ok(())
    }

    #[test]
    fn perft_pos_4() -> Result<(), FENError> {
        let position = &mut Position::try_from(
            "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1",
        )?;

        assert_eq!(perft(position, 1), 6);
        assert_eq!(perft(position, 2), 264);
        assert_eq!(perft(position, 3), 9_467);
        assert_eq!(perft(position, 4), 422_333);

        Ok(())
    }

    #[test]
    fn perft_pos_5() -> Result<(), FENError> {
        let position =
            &mut Position::try_from("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8")?;

        assert_eq!(perft(position, 1), 44);
        assert_eq!(perft(position, 2), 1_486);
        assert_eq!(perft(position, 3), 62_379);

        Ok(())
    }

    #[test]
    fn perft_pos_6() -> Result<(), FENError> {
        let position = &mut Position::try_from(
            "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10",
        )?;

        assert_eq!(perft(position, 1), 46);
        assert_eq!(perft(position, 2), 2_079);
        assert_eq!(perft(position, 3), 89_890);

        Ok(())
    }
}
