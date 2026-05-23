use std::cmp::Reverse;

use arrayvec::ArrayVec;

use crate::{
    moves::Move,
    state::{PieceArray, State},
};

const MVV_LVA: PieceArray<PieceArray<u32>> = PieceArray::new([
    PieceArray::new([105, 205, 305, 405, 505, 605]),
    PieceArray::new([104, 204, 304, 404, 504, 604]),
    PieceArray::new([103, 203, 303, 403, 503, 603]),
    PieceArray::new([102, 202, 302, 402, 502, 602]),
    PieceArray::new([101, 201, 301, 401, 501, 601]),
    PieceArray::new([100, 200, 300, 400, 500, 600]),
]);

impl State {
    pub fn score(&self, mv: Move, ply: usize) -> u32 {
        if let Some(victim) = mv.capture() {
            return MVV_LVA[mv.piece()][victim] + 10000;
        }

        if Some(mv) == self.killer_moves[ply][0] {
            return 9000;
        }

        if Some(mv) == self.killer_moves[ply][1] {
            return 8000;
        }

        return 0;
    }

    pub fn sort_moves(&self, moves: &mut ArrayVec<Move, 256>, ply: usize) {
        moves.sort_by_key(|&mv| Reverse(self.score(mv, ply)));
    }
}
