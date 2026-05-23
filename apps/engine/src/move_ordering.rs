use std::cmp::Reverse;

use arrayvec::ArrayVec;

use crate::{moves::Move, state::PieceArray};

const MVV_LVA: PieceArray<PieceArray<u32>> = PieceArray::new([
    PieceArray::new([105, 205, 305, 405, 505, 605]),
    PieceArray::new([104, 204, 304, 404, 504, 604]),
    PieceArray::new([103, 203, 303, 403, 503, 603]),
    PieceArray::new([102, 202, 302, 402, 502, 602]),
    PieceArray::new([101, 201, 301, 401, 501, 601]),
    PieceArray::new([100, 200, 300, 400, 500, 600]),
]);

impl Move {
    pub fn score(&self) -> u32 {
        let victim = self.capture();

        match victim {
            Some(v) => MVV_LVA[self.piece()][v],
            None => 0,
        }
    }
}

pub fn sort_moves(moves: &mut ArrayVec<Move, 256>) {
    moves.sort_by_key(|mv| Reverse(mv.score()));
}
