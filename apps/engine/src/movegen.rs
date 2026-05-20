use crate::{
    attacks::{BLACK_PAWN_ATTACKS, KING_ATTACKS, KNIGHT_ATTACKS, WHITE_PAWN_ATTACKS},
    board::{Board, Color, Piece},
    get_bishop_attacks, get_bit, get_ls1b_index, get_queen_attacks, get_rook_attacks,
    moves::{Move, MoveData, PromotionPiece},
    pop_bit,
};

macro_rules! gen_moves {
    ($bitboard:expr, $get_attacks:expr, $callback:expr) => {{
        let mut board = $bitboard;
        while board != 0 {
            let source = get_ls1b_index!(board);
            let mut attacks = $get_attacks(source);

            while attacks != 0 {
                let target = get_ls1b_index!(attacks);
                $callback(source, target);
                pop_bit!(attacks, target);
            }

            pop_bit!(board, source);
        }
    }};
}

impl Board {
    pub fn is_square_attacked(&self, square: usize, color: Color) -> bool {
        let all_pieces = self.side_bitboards[Color::White] | self.side_bitboards[Color::Black];
        let opp_pawn_attacks = match color {
            Color::White => &BLACK_PAWN_ATTACKS,
            Color::Black => &WHITE_PAWN_ATTACKS,
        };

        opp_pawn_attacks[square] & self.piece_bitboards[color][Piece::Pawn] != 0
            || KNIGHT_ATTACKS[square] & self.piece_bitboards[color][Piece::Knight] != 0
            || KING_ATTACKS[square] & self.piece_bitboards[color][Piece::King] != 0
            || get_bishop_attacks!(square, all_pieces)
                & (self.piece_bitboards[color][Piece::Bishop]
                    | self.piece_bitboards[color][Piece::Queen])
                != 0
            || get_rook_attacks!(square, all_pieces)
                & (self.piece_bitboards[color][Piece::Rook]
                    | self.piece_bitboards[color][Piece::Queen])
                != 0
    }

    pub fn generate_pseudolegal_moves(&self, color: Color) -> Vec<Move> {
        let own = self.side_bitboards[color];
        let opp = self.side_bitboards[!color];
        let all = own | opp;
        let (pawn_attacks, pawn_offset, second_rank, last_rank, castling_source, castling_bit) =
            match color {
                Color::White => (&WHITE_PAWN_ATTACKS, 8, 8..16, 56..64, 4, 0),
                Color::Black => (&BLACK_PAWN_ATTACKS, -8, 48..56, 0..8, 60, 2),
            };
        let mut moves: Vec<Move> = vec![];

        let mut bitboard = self.piece_bitboards[color][Piece::Pawn];
        while bitboard != 0 {
            let source = get_ls1b_index!(bitboard);
            let target = ((source as i32) + pawn_offset) as u32;

            if get_bit!(all, target) == 0 {
                if last_rank.contains(&target) {
                    push_promotions(&mut moves, source, target, false);
                } else {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Pawn,
                        ..Default::default()
                    }));
                }
            }

            if second_rank.contains(&source) {
                let double_target = ((source as i32) + pawn_offset * 2) as u32;

                if get_bit!(all, target) == 0 && get_bit!(all, double_target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target: double_target,
                        piece: Piece::Pawn,
                        double: true,
                        ..Default::default()
                    }));
                }
            }

            pop_bit!(bitboard, source);
        }

        gen_moves!(
            self.piece_bitboards[color][Piece::Pawn],
            |source| pawn_attacks[source as usize],
            |source: u32, target: u32| {
                if get_bit!(opp, target) != 0 {
                    if last_rank.contains(&target) {
                        push_promotions(&mut moves, source, target, true);
                    } else {
                        moves.push(Move::new(MoveData {
                            source,
                            target,
                            piece: Piece::Pawn,
                            capture: true,
                            ..Default::default()
                        }));
                    }
                } else if self.enpassant == Some(target as u8) {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Pawn,
                        enpassant: true,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.piece_bitboards[color][Piece::Knight],
            |source| KNIGHT_ATTACKS[source as usize],
            |source: u32, target: u32| {
                if get_bit!(own, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Knight,
                        capture: get_bit!(opp, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.piece_bitboards[color][Piece::Bishop],
            |source| get_bishop_attacks!(source as usize, all),
            |source: u32, target: u32| {
                if get_bit!(own, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Bishop,
                        capture: get_bit!(opp, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.piece_bitboards[color][Piece::Rook],
            |source| get_rook_attacks!(source as usize, all),
            |source: u32, target: u32| {
                if get_bit!(own, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Rook,
                        capture: get_bit!(opp, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.piece_bitboards[color][Piece::Queen],
            |source| get_queen_attacks!(source as usize, all),
            |source: u32, target: u32| {
                if get_bit!(own, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Queen,
                        capture: get_bit!(opp, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.piece_bitboards[color][Piece::King],
            |source| KING_ATTACKS[source as usize],
            |source: u32, target: u32| {
                if get_bit!(own, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::King,
                        capture: get_bit!(opp, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        if get_bit!(self.castling_rights, castling_bit) != 0
            && get_bit!(all, castling_source + 1) == 0
            && get_bit!(all, castling_source + 2) == 0
            && get_bit!(
                self.piece_bitboards[color][Piece::Rook],
                castling_source + 3
            ) != 0
            && !self.is_square_attacked(castling_source, !color)
            && !self.is_square_attacked(castling_source + 1, !color)
        {
            moves.push(Move::new(MoveData {
                source: castling_source as u32,
                target: (castling_source + 2) as u32,
                piece: Piece::King,
                castling: true,
                ..Default::default()
            }));
        }

        if get_bit!(self.castling_rights, castling_bit + 1) != 0
            && get_bit!(all, castling_source - 1) == 0
            && get_bit!(all, castling_source - 2) == 0
            && get_bit!(all, castling_source - 3) == 0
            && get_bit!(
                self.piece_bitboards[color][Piece::Rook],
                castling_source - 4
            ) != 0
            && !self.is_square_attacked(castling_source, !color)
            && !self.is_square_attacked(castling_source - 1, !color)
        {
            moves.push(Move::new(MoveData {
                source: castling_source as u32,
                target: (castling_source - 2) as u32,
                piece: Piece::King,
                castling: true,
                ..Default::default()
            }));
        }

        return moves;
    }
}

#[inline(always)]
fn push_promotions(moves: &mut Vec<Move>, source: u32, target: u32, capture: bool) {
    for piece in [
        PromotionPiece::Queen,
        PromotionPiece::Rook,
        PromotionPiece::Bishop,
        PromotionPiece::Knight,
    ] {
        moves.push(Move::new(MoveData {
            source,
            target,
            piece: Piece::Pawn,
            promoted: Some(piece),
            capture,
            ..Default::default()
        }));
    }
}

#[cfg(test)]
mod test {
    use crate::board::Board;

    fn perft(board: &Board, depth: u32) -> u64 {
        if depth == 0 {
            return 1;
        }

        let moves = board.get_legal_moves();

        if depth == 1 {
            return moves.len() as u64;
        }

        moves
            .iter()
            .map(|&m| {
                let mut new_board = *board;
                new_board.make_move(m);
                perft(&new_board, depth - 1)
            })
            .sum()
    }

    #[test]
    fn perft_startpos() {
        let board =
            Board::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").unwrap();

        assert_eq!(perft(&board, 1), 20);
        assert_eq!(perft(&board, 2), 400);
        assert_eq!(perft(&board, 3), 8_902);
        assert_eq!(perft(&board, 4), 197_281);
        assert_eq!(perft(&board, 5), 4_865_609);
    }

    #[test]
    fn perft_kiwipete() {
        let board =
            Board::try_from("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1")
                .unwrap();

        assert_eq!(perft(&board, 1), 48);
        assert_eq!(perft(&board, 2), 2_039);
        assert_eq!(perft(&board, 3), 97_862);
    }
}
