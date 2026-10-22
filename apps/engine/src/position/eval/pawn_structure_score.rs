use crate::{
    bitboard::BitboardOperations,
    masks::pawns::{
        BACKWARD_PAWN_MASKS, DOUBLED_PAWN_MASKS, ISOLATED_PAWN_MASKS, PASSED_PAWN_MASKS,
        PAWN_ATTACKS,
    },
    position::{
        Position,
        eval::scores::{
            BACKWARD_PAWN_PENALTY, DOUBLED_PAWN_PENALTY, ISOLATED_PAWN_PENALTY, PASSED_PAWN_BONUSES,
        },
        hash::pawn::PawnHashTableEntry,
    },
    types::{Color, Piece},
};

impl Position {
    #[inline(always)]
    pub(in crate::position::eval) fn absolute_pawn_structure_score(&mut self) -> i32 {
        if let Some(entry) = self.pawn_hash_table.probe(self.pawn_hash_key()) {
            return entry.evaluation;
        }

        let score = self.pawn_structure_score::<false>() - self.pawn_structure_score::<true>();
        self.pawn_hash_table.store(PawnHashTableEntry {
            zobrist_key: self.pawn_hash_key(),
            evaluation: score,
        });

        score
    }

    #[inline(always)]
    fn pawn_structure_score<const IS_BLACK: bool>(&self) -> i32 {
        let mut score = 0;
        let color = if IS_BLACK { Color::Black } else { Color::White };
        let opp_color = if IS_BLACK { Color::White } else { Color::Black };
        let flip: u32 = if IS_BLACK { 56 } else { 0 };
        let below_offset: i32 = if IS_BLACK { -8 } else { 8 };

        self.piece_bitboards[color][Piece::Pawn].foreach(|square| {
            if PASSED_PAWN_MASKS[color as usize][square as usize]
                & self.piece_bitboards[opp_color][Piece::Pawn]
                == 0
            {
                score += PASSED_PAWN_BONUSES[((square ^ flip) / 8) as usize];
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
            } else if BACKWARD_PAWN_MASKS[color as usize][square as usize]
                & self.piece_bitboards[color][Piece::Pawn]
                == 0
                && PAWN_ATTACKS[color as usize][(square as i32 + below_offset) as usize]
                    & self.piece_bitboards[opp_color][Piece::Pawn]
                    != 0
            {
                score += BACKWARD_PAWN_PENALTY;
            }
        });

        score
    }
}
