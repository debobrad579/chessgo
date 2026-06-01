use crate::types::{ColorArray, Move};

mod negamax;
mod ordering;
mod pv;
mod quiescence;
mod tt;

const MAX_PLY: usize = 128;

pub struct Search {
    nodes: u32,
    killer_moves: [[Option<Move>; 2]; MAX_PLY],
    history_moves: ColorArray<[[u32; 64]; 64]>,
    pv_table: [[Option<Move>; MAX_PLY]; MAX_PLY],
    pv_length: [usize; MAX_PLY],
    tt: tt::TranspositionTable,
}

impl Default for Search {
    fn default() -> Self {
        Self {
            nodes: 0,
            killer_moves: [[None; 2]; MAX_PLY],
            history_moves: ColorArray::new([[[0; 64]; 64], [[0; 64]; 64]]),
            pv_table: [[None; MAX_PLY]; MAX_PLY],
            pv_length: [0; MAX_PLY],
            tt: tt::TranspositionTable::new(10),
        }
    }
}

impl Search {
    pub fn nodes(&self) -> u32 {
        self.nodes
    }
}
