use crate::{moves::Move, search::MAX_PLY};

#[derive(Debug, PartialEq)]
pub struct PVTable {
    table: [[Option<Move>; MAX_PLY]; MAX_PLY],
    length: [usize; MAX_PLY],
}

impl Default for PVTable {
    fn default() -> Self {
        Self {
            table: [[None; MAX_PLY]; MAX_PLY],
            length: [0; MAX_PLY],
        }
    }
}

impl PVTable {
    pub fn update(&mut self, ply: usize, mv: Move) {
        self.table[ply][ply] = Some(mv);

        for next_ply in (ply + 1)..self.length[ply + 1] {
            self.table[ply][next_ply] = self.table[ply + 1][next_ply];
        }

        self.length[ply] = self.length[ply + 1];
    }

    pub fn init_ply(&mut self, ply: usize) {
        self.length[ply] = ply;
    }

    pub fn best_move(&self) -> Option<Move> {
        self.table[0][0]
    }
}
