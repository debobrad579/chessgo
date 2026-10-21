use crate::{
    attacks::{
        BACKWARD_PAWN_MASKS, DOUBLED_PAWN_MASKS, ISOLATED_PAWN_MASKS, PASSED_PAWN_MASKS,
        PAWN_ATTACKS,
    },
    bitboard::BitboardOperations,
    position::{
        Position,
        eval::{
            BACKWARD_PAWN_PENALTY, DOUBLED_PAWN_PENALTY, ISOLATED_PAWN_PENALTY, PASSED_PAWN_BONUSES,
        },
        hash::pawn_hash_table::Entry,
    },
    types::{Color, Piece},
};

impl Position {
    #[inline(always)]
    pub(in crate::position::eval) fn pawn_structure_score(&mut self, color: Color) -> i32 {
        if let Some(entry) = self.pawn_hash_table.probe(self.pawn_hash_key()) {
            return entry.evaluation;
        }

        let mut score = 0;

        self.piece_bitboards[color][Piece::Pawn].foreach(|square| {
            let (relative_rank, square_infront) = match color {
                Color::White => (square / 8, square + 8),
                Color::Black => ((square ^ 56) / 8, square - 8),
            };

            if PASSED_PAWN_MASKS[color as usize][square as usize]
                & self.piece_bitboards[!color][Piece::Pawn]
                == 0
            {
                score += PASSED_PAWN_BONUSES[relative_rank as usize];
            }

            if DOUBLED_PAWN_MASKS[color as usize][square as usize]
                & self.piece_bitboards[color][Piece::Pawn]
                != 0
            {
                score += DOUBLED_PAWN_PENALTY;
            }

            if ISOLATED_PAWN_MASKS[square as usize] & self.piece_bitboards[color][Piece::Pawn] == 0
            {
                score += ISOLATED_PAWN_PENALTY;
            }

            if BACKWARD_PAWN_MASKS[color as usize][square as usize]
                & self.piece_bitboards[color][Piece::Pawn]
                == 0
                && PAWN_ATTACKS[color as usize][square_infront as usize]
                    & self.piece_bitboards[!color][Piece::Pawn]
                    != 0
            {
                score += BACKWARD_PAWN_PENALTY;
            }
        });

        self.pawn_hash_table.store(Entry {
            zobrist_key: self.pawn_hash_key(),
            evaluation: score,
        });

        score
    }
}
