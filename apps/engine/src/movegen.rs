use crate::{
    attacks::{BLACK_PAWN_ATTACKS, KING_ATTACKS, KNIGHT_ATTACKS, WHITE_PAWN_ATTACKS},
    board::Board,
    get_bishop_attacks, get_bit, get_ls1b_index, get_queen_attacks, get_rook_attacks,
    moves::{Move, MoveData, Piece, PromotionPiece},
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
    fn white_attacks_square(&self, square: usize) -> bool {
        let all_pieces = self.white_pieces | self.black_pieces;

        BLACK_PAWN_ATTACKS[square] & self.white_pawns != 0
            || KNIGHT_ATTACKS[square] & self.white_knights != 0
            || KING_ATTACKS[square] & self.white_king != 0
            || get_bishop_attacks!(square, all_pieces) & (self.white_bishops | self.white_queens)
                != 0
            || get_rook_attacks!(square, all_pieces) & (self.white_rooks | self.white_queens) != 0
    }

    fn black_attacks_square(&self, square: usize) -> bool {
        let all_pieces = self.white_pieces | self.black_pieces;

        WHITE_PAWN_ATTACKS[square] & self.black_pawns != 0
            || KNIGHT_ATTACKS[square] & self.black_knights != 0
            || KING_ATTACKS[square] & self.black_king != 0
            || get_bishop_attacks!(square, all_pieces) & (self.black_bishops | self.black_queens)
                != 0
            || get_rook_attacks!(square, all_pieces) & (self.black_rooks | self.black_queens) != 0
    }

    pub fn generate_white_moves(&self) -> Vec<Move> {
        let all_pieces = self.white_pieces | self.black_pieces;
        let mut moves: Vec<Move> = vec![];

        let mut bitboard = self.white_pawns;
        while bitboard != 0 {
            let source = get_ls1b_index!(bitboard);
            let target = source + 8;

            if get_bit!(all_pieces, target) == 0 {
                if (56..64).contains(&target) {
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

            if (8..16).contains(&source) {
                let target = source + 16;

                if get_bit!(all_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Pawn,
                        double: true,
                        ..Default::default()
                    }));
                }
            }

            pop_bit!(bitboard, source);
        }

        gen_moves!(
            self.white_pawns,
            |source| WHITE_PAWN_ATTACKS[source as usize],
            |source: u32, target: u32| {
                if self.enpassant == Some(target as u8) || get_bit!(self.black_pieces, target) != 0
                {
                    if (56..64).contains(&target) {
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
                }
            }
        );

        gen_moves!(
            self.white_knights,
            |source| KNIGHT_ATTACKS[source as usize],
            |source: u32, target: u32| {
                if get_bit!(self.white_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Knight,
                        capture: get_bit!(self.black_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.white_bishops,
            |source| get_bishop_attacks!(source as usize, all_pieces),
            |source: u32, target: u32| {
                if get_bit!(self.white_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Bishop,
                        capture: get_bit!(self.black_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.white_rooks,
            |source| get_rook_attacks!(source as usize, all_pieces),
            |source: u32, target: u32| {
                if get_bit!(self.white_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Rook,
                        capture: get_bit!(self.black_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.white_queens,
            |source| get_queen_attacks!(source as usize, all_pieces),
            |source: u32, target: u32| {
                if get_bit!(self.white_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Queen,
                        capture: get_bit!(self.black_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.white_king,
            |source| KING_ATTACKS[source as usize],
            |source: u32, target: u32| {
                if get_bit!(self.white_pieces, target) == 0
                    && !self.black_attacks_square(target as usize)
                {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::King,
                        capture: get_bit!(self.black_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        if get_bit!(self.castling_rights, 0) != 0
            && get_bit!(all_pieces, 5) == 0
            && get_bit!(all_pieces, 6) == 0
            && !self.black_attacks_square(5)
            && !self.black_attacks_square(6)
        {
            moves.push(Move::new(MoveData {
                source: 4,
                target: 6,
                piece: Piece::King,
                castling: true,
                ..Default::default()
            }));
        }

        if get_bit!(self.castling_rights, 1) != 0
            && get_bit!(all_pieces, 3) == 0
            && get_bit!(all_pieces, 2) == 0
            && !self.black_attacks_square(3)
            && !self.black_attacks_square(2)
        {
            moves.push(Move::new(MoveData {
                source: 4,
                target: 2,
                piece: Piece::King,
                castling: true,
                ..Default::default()
            }));
        }

        return moves;
    }

    pub fn generate_black_moves(&self) -> Vec<Move> {
        let all_pieces = self.white_pieces | self.black_pieces;
        let mut moves: Vec<Move> = vec![];

        let mut bitboard = self.black_pawns;
        while bitboard != 0 {
            let source = get_ls1b_index!(bitboard);
            let target = source - 8;

            if get_bit!(all_pieces, target) == 0 {
                if (0..8).contains(&target) {
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

            if (48..56).contains(&source) {
                let target = source - 16;

                if get_bit!(all_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Pawn,
                        double: true,
                        ..Default::default()
                    }));
                }
            }

            pop_bit!(bitboard, source);
        }

        gen_moves!(
            self.black_pawns,
            |source| BLACK_PAWN_ATTACKS[source as usize],
            |source: u32, target: u32| {
                if self.enpassant == Some(target as u8) || get_bit!(self.white_pieces, target) != 0
                {
                    if (0..8).contains(&target) {
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
                }
            }
        );

        gen_moves!(
            self.black_knights,
            |source| KNIGHT_ATTACKS[source as usize],
            |source: u32, target: u32| {
                if get_bit!(self.black_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Knight,
                        capture: get_bit!(self.white_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.black_bishops,
            |source| get_bishop_attacks!(source as usize, all_pieces),
            |source: u32, target: u32| {
                if get_bit!(self.black_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Bishop,
                        capture: get_bit!(self.white_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.black_rooks,
            |source| get_rook_attacks!(source as usize, all_pieces),
            |source: u32, target: u32| {
                if get_bit!(self.black_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Rook,
                        capture: get_bit!(self.white_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.black_queens,
            |source| get_queen_attacks!(source as usize, all_pieces),
            |source: u32, target: u32| {
                if get_bit!(self.black_pieces, target) == 0 {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::Queen,
                        capture: get_bit!(self.white_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        gen_moves!(
            self.black_king,
            |source| KING_ATTACKS[source as usize],
            |source: u32, target: u32| {
                if get_bit!(self.black_pieces, target) == 0
                    && !self.white_attacks_square(target as usize)
                {
                    moves.push(Move::new(MoveData {
                        source,
                        target,
                        piece: Piece::King,
                        capture: get_bit!(self.white_pieces, target) != 0,
                        ..Default::default()
                    }));
                }
            }
        );

        if get_bit!(self.castling_rights, 2) != 0
            && get_bit!(all_pieces, 61) == 0
            && get_bit!(all_pieces, 62) == 0
            && !self.white_attacks_square(61)
            && !self.white_attacks_square(62)
        {
            moves.push(Move::new(MoveData {
                source: 60,
                target: 62,
                piece: Piece::King,
                castling: true,
                ..Default::default()
            }));
        }

        if get_bit!(self.castling_rights, 3) != 0
            && get_bit!(all_pieces, 59) == 0
            && get_bit!(all_pieces, 58) == 0
            && !self.white_attacks_square(59)
            && !self.white_attacks_square(58)
        {
            moves.push(Move::new(MoveData {
                source: 60,
                target: 58,
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
            promoted: piece,
            capture,
            ..Default::default()
        }));
    }
}
