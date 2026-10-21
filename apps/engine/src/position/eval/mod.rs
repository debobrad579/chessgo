use crate::{position::Position, types::Color};

mod pawn_structure_score;
mod piece_score;
mod scores;

impl Position {
    #[inline(always)]
    pub fn evaluation(&mut self, color: Color) -> i32 {
        let score = self.absolute_piece_score() + self.absolute_pawn_structure_score();
        match color {
            Color::White => score,
            Color::Black => -score,
        }
    }
}
