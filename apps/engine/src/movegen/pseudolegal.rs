use arrayvec::ArrayVec;

use crate::{
    get_bishop_attacks, get_bit, get_ls1b_index, get_queen_attacks, get_rook_attacks,
    movegen::attacks::{BLACK_PAWN_ATTACKS, KING_ATTACKS, KNIGHT_ATTACKS, WHITE_PAWN_ATTACKS},
    pop_bit,
    position::Position,
    types::{Color, Piece},
    types::{Move, PromotionPiece},
};

impl Position {
    #[inline(always)]
    pub fn is_square_attacked(&self, square: usize, color: Color) -> bool {
        let opp_pawn_attacks = match color {
            Color::White => &BLACK_PAWN_ATTACKS,
            Color::Black => &WHITE_PAWN_ATTACKS,
        };

        opp_pawn_attacks[square] & self.piece_bitboards[color][Piece::Pawn] != 0
            || KNIGHT_ATTACKS[square] & self.piece_bitboards[color][Piece::Knight] != 0
            || KING_ATTACKS[square] & self.piece_bitboards[color][Piece::King] != 0
            || get_bishop_attacks!(square, self.occupancy)
                & (self.piece_bitboards[color][Piece::Bishop]
                    | self.piece_bitboards[color][Piece::Queen])
                != 0
            || get_rook_attacks!(square, self.occupancy)
                & (self.piece_bitboards[color][Piece::Rook]
                    | self.piece_bitboards[color][Piece::Queen])
                != 0
    }

    #[inline(always)]
    pub fn get_target_piece(&self, color: Color, square: u32) -> Option<Piece> {
        for piece in Piece::iter() {
            if get_bit!(self.piece_bitboards[color][piece], square) != 0 {
                return Some(piece);
            }
        }

        return None;
    }

    pub fn generate_pseudolegal_moves(&self, color: Color) -> ArrayVec<Move, 256> {
        let own = self.side_bitboards[color];
        let opp_color = !color;
        let opp = self.side_bitboards[opp_color];
        let (pawn_attacks, pawn_offset, second_rank, last_rank, castling_source, castling_bit) =
            match color {
                Color::White => (&WHITE_PAWN_ATTACKS, 8, 8..16, 56..64, 4, 0),
                Color::Black => (&BLACK_PAWN_ATTACKS, -8, 48..56, 0..8, 60, 2),
            };
        let mut moves = ArrayVec::<Move, 256>::new();

        let mut bitboard = self.piece_bitboards[color][Piece::Pawn];
        while bitboard != 0 {
            let source = get_ls1b_index!(bitboard);

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

            if get_bit!(self.occupancy, target) == 0 {
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

                    if get_bit!(self.occupancy, double_target) == 0 {
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

            let mut attacks = pawn_attacks[source as usize];

            while attacks != 0 {
                let target = get_ls1b_index!(attacks);
                if get_bit!(opp, target) != 0 {
                    if last_rank.contains(&target) {
                        gen_promotions!(target, self.get_target_piece(opp_color, target));
                    } else {
                        moves.push(Move::new(
                            source,
                            target,
                            Piece::Pawn,
                            None,
                            self.get_target_piece(opp_color, target),
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
                pop_bit!(attacks, target);
            }

            pop_bit!(bitboard, source);
        }

        macro_rules! gen_moves {
            ($piece:expr, $get_attacks:expr) => {{
                let mut board = self.piece_bitboards[color][$piece];
                while board != 0 {
                    let source = get_ls1b_index!(board);
                    let mut attacks = $get_attacks(source) & !own;

                    while attacks != 0 {
                        let target = get_ls1b_index!(attacks);

                        moves.push(Move::new(
                            source,
                            target,
                            $piece,
                            None,
                            self.get_target_piece(opp_color, target),
                            false,
                            false,
                            false,
                        ));

                        pop_bit!(attacks, target);
                    }

                    pop_bit!(board, source);
                }
            }};
        }

        gen_moves!(Piece::Knight, |source| KNIGHT_ATTACKS[source as usize]);

        gen_moves!(Piece::Bishop, |source| get_bishop_attacks!(
            source as usize,
            self.occupancy
        ));

        gen_moves!(Piece::Rook, |source| get_rook_attacks!(
            source as usize,
            self.occupancy
        ));

        gen_moves!(Piece::Queen, |source| get_queen_attacks!(
            source as usize,
            self.occupancy
        ));

        gen_moves!(Piece::King, |source| KING_ATTACKS[source as usize]);

        if get_bit!(self.castling_rights, castling_bit) != 0
            && get_bit!(
                self.piece_bitboards[color][Piece::Rook],
                castling_source + 3
            ) != 0
            && get_bit!(self.occupancy, castling_source + 1) == 0
            && get_bit!(self.occupancy, castling_source + 2) == 0
            && !self.is_square_attacked(castling_source, !color)
            && !self.is_square_attacked(castling_source + 1, !color)
        {
            moves.push(Move::new(
                castling_source as u32,
                (castling_source + 2) as u32,
                Piece::King,
                None,
                None,
                false,
                false,
                true,
            ));
        }

        if get_bit!(self.castling_rights, castling_bit + 1) != 0
            && get_bit!(
                self.piece_bitboards[color][Piece::Rook],
                castling_source - 4
            ) != 0
            && get_bit!(self.occupancy, castling_source - 1) == 0
            && get_bit!(self.occupancy, castling_source - 2) == 0
            && get_bit!(self.occupancy, castling_source - 3) == 0
            && !self.is_square_attacked(castling_source, !color)
            && !self.is_square_attacked(castling_source - 1, !color)
        {
            moves.push(Move::new(
                castling_source as u32,
                (castling_source - 2) as u32,
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

    pub fn generate_pseudolegal_captures(&self, color: Color) -> ArrayVec<Move, 256> {
        let opp_color = !color;
        let opp = self.side_bitboards[opp_color];
        let (pawn_attacks, last_rank) = match color {
            Color::White => (&WHITE_PAWN_ATTACKS, 56..64),
            Color::Black => (&BLACK_PAWN_ATTACKS, 0..8),
        };
        let mut moves = ArrayVec::<Move, 256>::new();

        let mut bitboard = self.piece_bitboards[color][Piece::Pawn];
        while bitboard != 0 {
            let source = get_ls1b_index!(bitboard);

            let mut attacks = pawn_attacks[source as usize];

            while attacks != 0 {
                let target = get_ls1b_index!(attacks);
                if get_bit!(opp, target) != 0 {
                    if last_rank.contains(&target) {
                        for piece in PromotionPiece::iter() {
                            moves.push(Move::new(
                                source,
                                target,
                                Piece::Pawn,
                                Some(piece),
                                self.get_target_piece(opp_color, target),
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
                            self.get_target_piece(opp_color, target),
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

                pop_bit!(attacks, target);
            }

            pop_bit!(bitboard, source);
        }

        macro_rules! gen_moves {
            ($piece:expr, $get_attacks:expr) => {{
                let mut board = self.piece_bitboards[color][$piece];
                while board != 0 {
                    let source = get_ls1b_index!(board);
                    let mut attacks = $get_attacks(source) & opp;

                    while attacks != 0 {
                        let target = get_ls1b_index!(attacks);

                        moves.push(Move::new(
                            source,
                            target,
                            $piece,
                            None,
                            self.get_target_piece(opp_color, target),
                            false,
                            false,
                            false,
                        ));

                        pop_bit!(attacks, target);
                    }

                    pop_bit!(board, source);
                }
            }};
        }

        gen_moves!(Piece::Knight, |source| KNIGHT_ATTACKS[source as usize]);

        gen_moves!(Piece::Bishop, |source| get_bishop_attacks!(
            source as usize,
            self.occupancy
        ));

        gen_moves!(Piece::Rook, |source| get_rook_attacks!(
            source as usize,
            self.occupancy
        ));

        gen_moves!(Piece::Queen, |source| get_queen_attacks!(
            source as usize,
            self.occupancy
        ));

        gen_moves!(Piece::King, |source| KING_ATTACKS[source as usize]);

        return moves;
    }
}

#[cfg(test)]
mod test {
    use crate::{movegen::perft::perft, position::Position, position::fen::FENError};

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
