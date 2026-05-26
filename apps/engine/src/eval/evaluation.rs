use crate::{
    eval::scores::{ENDGAME_POSITIONAL_SCORES, MATERIAL_SCORES, MIDDLEGAME_POSITIONAL_SCORES},
    get_ls1b_index, pop_bit,
    position::Position,
    types::{Color, Piece},
};

impl Position {
    #[inline(always)]
    fn evaluate(&self, color: Color) -> i32 {
        let mut score = 0;

        for piece in Piece::iter() {
            let mut bitboard = self.piece_bitboards[color][piece];
            while bitboard != 0 {
                let square = get_ls1b_index!(bitboard);

                score += MATERIAL_SCORES[piece];
                let relative_square = match color {
                    Color::White => square,
                    Color::Black => square ^ 56,
                };
                score += if self.is_endgame() {
                    ENDGAME_POSITIONAL_SCORES[piece][relative_square as usize]
                } else {
                    MIDDLEGAME_POSITIONAL_SCORES[piece][relative_square as usize]
                };

                pop_bit!(bitboard, square);
            }
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
