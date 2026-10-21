use crate::{
    bitboard::BitboardOperations,
    position::{
        Position,
        eval::scores::{ENDGAME_POSITIONAL_SCORES, MATERIAL_SCORES, MIDDLEGAME_POSITIONAL_SCORES},
    },
    types::{Color, Piece},
};

impl Position {
    #[inline(always)]
    pub(in crate::position::eval) fn absolute_piece_score(&self) -> i32 {
        self.piece_score::<false>() - self.piece_score::<true>()
    }

    #[inline(always)]
    fn piece_score<const IS_BLACK: bool>(&self) -> i32 {
        let color = if IS_BLACK { Color::Black } else { Color::White };
        let flip: u32 = if IS_BLACK { 56 } else { 0 };

        let mut score = 0;
        let is_endgame = self.is_endgame();

        for piece in Piece::iter() {
            self.piece_bitboards[color][piece].foreach(|square| {
                score += MATERIAL_SCORES[piece];

                score += if is_endgame {
                    ENDGAME_POSITIONAL_SCORES[piece][(square ^ flip) as usize]
                } else {
                    MIDDLEGAME_POSITIONAL_SCORES[piece][(square ^ flip) as usize]
                };
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
}
