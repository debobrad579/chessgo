use crate::{
    position::Position,
    types::{ColorArray, Move},
};

pub mod negamax;
pub mod ordering;
pub mod pv;
pub mod quiescence;

pub(super) const MAX_PLY: usize = 128;

pub(super) struct Search {
    pub killer_moves: Box<[[Option<Move>; 2]; MAX_PLY]>,
    pub history_moves: Box<ColorArray<[[u32; 64]; 64]>>,
    pub pv_table: [[Option<Move>; MAX_PLY]; MAX_PLY],
    pub pv_length: [usize; MAX_PLY],
}

impl Search {
    fn new() -> Self {
        Self {
            killer_moves: Box::new([[None; 2]; MAX_PLY]),
            history_moves: Box::new(ColorArray::new([[[0; 64]; 64], [[0; 64]; 64]])),
            pv_table: [[None; MAX_PLY]; MAX_PLY],
            pv_length: [0; MAX_PLY],
        }
    }
}

impl Position {
    pub fn search(&mut self, depth: u32) -> Move {
        let mut search = Search::new();
        search.negamax(self, depth, -2_000_000_000, 2_000_000_000, 0);
        search.best_move().expect("no legal moves")
    }
}
