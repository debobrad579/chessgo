use crate::{
    bitboard::BitboardOperations,
    position::Position,
    types::{Color, Piece},
};

mod scores;

impl Position {
    #[inline(always)]
    fn evaluate(&self, color: Color) -> i32 {
        let mut score = 0;

        for piece in Piece::iter() {
            self.piece_bitboards[color][piece].foreach(|square| {
                score += scores::MATERIAL_SCORES[piece];
                let relative_square = match color {
                    Color::White => square,
                    Color::Black => square ^ 56,
                };
                score += if self.is_endgame() {
                    scores::ENDGAME_POSITIONAL_SCORES[piece][relative_square as usize]
                } else {
                    scores::MIDDLEGAME_POSITIONAL_SCORES[piece][relative_square as usize]
                };
            });
        }

        score
    }

    #[inline(always)]
    fn is_endgame(&self) -> bool {
        (self.occupancy
            & self.piece_bitboards[Color::White][Piece::Pawn].wrapping_neg()
            & self.piece_bitboards[Color::Black][Piece::Pawn].wrapping_neg())
        .count_ones()
            < 8
    }

    #[inline(always)]
    pub fn evaluation(&self, color: Color) -> i32 {
        self.evaluate(color) - self.evaluate(!color)
    }
}
