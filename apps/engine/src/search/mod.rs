use crate::types::{ColorArray, Move};

pub mod negamax;
pub mod ordering;
pub mod pv;
pub mod quiescence;

pub(super) const MAX_PLY: usize = 128;

pub struct Search {
    pub(super) nodes: u32,
    pub(super) killer_moves: Box<[[Option<Move>; 2]; MAX_PLY]>,
    pub(super) history_moves: Box<ColorArray<[[u32; 64]; 64]>>,
    pub(super) pv_table: [[Option<Move>; MAX_PLY]; MAX_PLY],
    pub(super) pv_length: [usize; MAX_PLY],
    pub re_searches: u32,
}

impl Default for Search {
    fn default() -> Self {
        Self {
            nodes: 0,
            killer_moves: Box::new([[None; 2]; MAX_PLY]),
            history_moves: Box::new(ColorArray::new([[[0; 64]; 64], [[0; 64]; 64]])),
            pv_table: [[None; MAX_PLY]; MAX_PLY],
            pv_length: [0; MAX_PLY],
            re_searches: 0,
        }
    }
}

impl Search {
    pub fn nodes(&self) -> u32 {
        self.nodes
    }
}
