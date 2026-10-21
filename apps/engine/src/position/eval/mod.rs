use crate::{
    attacks::{DOUBLED_PAWN_MASKS, PASSED_PAWN_MASKS},
    bitboard::BitboardOperations,
    position::Position,
    types::{Color, Piece},
};

mod scores;

impl Position {
    #[inline(always)]
    fn evaluate(&self, color: Color) -> i32 {
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

                if piece == Piece::Pawn {
                    if PASSED_PAWN_MASKS[color as usize][square as usize]
                        & self.piece_bitboards[!color][Piece::Pawn]
                        == 0
                    {
                        score += 10 * (relative_square / 8) as i32
                    }

                    if DOUBLED_PAWN_MASKS[color as usize][square as usize]
                        & self.piece_bitboards[color][Piece::Pawn]
                        != 0
                    {
                        score -= 30;
                    }
                }
            });
        }

        score
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
    pub fn evaluation(&self, color: Color) -> i32 {
        self.evaluate(color) - self.evaluate(!color)
    }
}
