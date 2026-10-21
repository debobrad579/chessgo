use crate::{
    bitboard::BitboardOperations,
    position::{
        Position,
        eval::scores::{
            BACKWARD_PAWN_PENALTY, DOUBLED_PAWN_PENALTY, ISOLATED_PAWN_PENALTY, PASSED_PAWN_BONUSES,
        },
    },
    types::{Color, Piece},
};

mod pawn_structure;
mod scores;

impl Position {
    #[inline(always)]
    fn evaluate(&mut self, color: Color) -> i32 {
        let mut score = 0;
        let is_endgame = self.is_endgame();

        for piece in Piece::iter() {
            self.piece_bitboards[color][piece].foreach(|square| {
                score += scores::MATERIAL_SCORES[piece];

                let relative_square = match color {
                    Color::White => square,
                    Color::Black => square ^ 56,
                } as usize;

                score += if is_endgame {
                    scores::ENDGAME_POSITIONAL_SCORES[piece][relative_square]
                } else {
                    scores::MIDDLEGAME_POSITIONAL_SCORES[piece][relative_square]
                };
            });
        }

        score + self.pawn_structure_score(color)
    }

    #[inline(always)]
    fn is_endgame(&self) -> bool {
        (self.occupancy
            & !self.piece_bitboards[Color::White][Piece::Pawn]
            & !self.piece_bitboards[Color::Black][Piece::Pawn])
            .count_ones()
            < 8
    }

    #[inline(always)]
    pub fn evaluation(&mut self, color: Color) -> i32 {
        self.evaluate(color) - self.evaluate(!color)
    }
}
