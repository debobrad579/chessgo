use crate::{
    attacks::{BLACK_PAWN_ATTACKS, KING_ATTACKS, KNIGHT_ATTACKS, WHITE_PAWN_ATTACKS},
    board::Board,
    get_bishop_attacks, get_bit, get_ls1b_index, get_queen_attacks, get_rook_attacks, pop_bit,
};

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

    pub fn generate_white_moves(&self) {
        let all_pieces = self.white_pieces | self.black_pieces;
        let mut source: u32;
        let mut target: u32;
        let mut attacks: u64;

        let mut current_bitboard = self.white_pawns;
        while current_bitboard != 0 {
            source = get_ls1b_index!(current_bitboard);
            target = source + 8;

            if get_bit!(all_pieces, target) == 0 {
                if (56..64).contains(&target) {
                    println!("{}-{}=q", source, target);
                    println!("{}-{}=r", source, target);
                    println!("{}-{}=b", source, target);
                    println!("{}-{}=k", source, target);
                } else {
                    println!("{}-{}", source, target);
                }
            }

            if (8..16).contains(&source) {
                target = source + 16;

                if get_bit!(all_pieces, target) == 0 {
                    println!("{}-{}", source, target);
                }
            }

            attacks = WHITE_PAWN_ATTACKS[source as usize];
            while attacks != 0 {
                target = get_ls1b_index!(attacks);

                if self.enpassant == Some(target as u8) || get_bit!(self.black_pieces, target) != 0
                {
                    println!("x{}-{}", source, target);
                }

                pop_bit!(attacks, target);
            }

            pop_bit!(current_bitboard, source);
        }

        current_bitboard = self.white_knights;
        while current_bitboard != 0 {
            source = get_ls1b_index!(current_bitboard);
            attacks = KNIGHT_ATTACKS[source as usize];

            while attacks != 0 {
                target = get_ls1b_index!(attacks);

                if get_bit!(self.white_pieces, target) == 0 {
                    println!("N{}-{}", source, target);
                }

                pop_bit!(attacks, target);
            }

            pop_bit!(current_bitboard, source);
        }

        current_bitboard = self.white_bishops;
        while current_bitboard != 0 {
            source = get_ls1b_index!(current_bitboard);
            attacks = get_bishop_attacks!(source as usize, all_pieces);

            while attacks != 0 {
                target = get_ls1b_index!(attacks);

                if get_bit!(self.white_pieces, target) == 0 {
                    println!("B{}-{}", source, target);
                }

                pop_bit!(attacks, target);
            }

            pop_bit!(current_bitboard, source);
        }

        current_bitboard = self.white_rooks;
        while current_bitboard != 0 {
            source = get_ls1b_index!(current_bitboard);
            attacks = get_rook_attacks!(source as usize, all_pieces);

            while attacks != 0 {
                target = get_ls1b_index!(attacks);

                if get_bit!(self.white_pieces, target) == 0 {
                    println!("R{}-{}", source, target);
                }

                pop_bit!(attacks, target);
            }

            pop_bit!(current_bitboard, source);
        }

        current_bitboard = self.white_queens;
        while current_bitboard != 0 {
            source = get_ls1b_index!(current_bitboard);
            attacks = get_queen_attacks!(source as usize, all_pieces);

            while attacks != 0 {
                target = get_ls1b_index!(attacks);

                if get_bit!(self.white_pieces, target) == 0 {
                    println!("Q{}-{}", source, target);
                }

                pop_bit!(attacks, target);
            }

            pop_bit!(current_bitboard, source);
        }

        current_bitboard = self.white_king;
        while current_bitboard != 0 {
            source = get_ls1b_index!(current_bitboard);
            attacks = KING_ATTACKS[source as usize];

            while attacks != 0 {
                target = get_ls1b_index!(attacks);

                if get_bit!(self.white_pieces, target) == 0
                    && !self.black_attacks_square(target as usize)
                {
                    println!("Q{}-{}", source, target);
                }

                pop_bit!(attacks, target);
            }

            pop_bit!(current_bitboard, source);
        }

        if get_bit!(self.castling_rights, 0) != 0
            && get_bit!(all_pieces, 5) == 0
            && get_bit!(all_pieces, 6) == 0
            && !self.black_attacks_square(5)
            && !self.black_attacks_square(6)
        {
            println!("O-O");
        }

        if get_bit!(self.castling_rights, 1) != 0
            && get_bit!(all_pieces, 3) == 0
            && get_bit!(all_pieces, 2) == 0
            && !self.black_attacks_square(3)
            && !self.black_attacks_square(2)
        {
            println!("O-O-O");
        }
    }
}
