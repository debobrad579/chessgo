use crate::moves::Move;

const MAX_DEPTH: usize = 64;

#[derive(Debug, PartialEq)]
pub struct PVTable {
    table: [[Option<Move>; MAX_DEPTH]; MAX_DEPTH],
    length: [usize; MAX_DEPTH],
}

impl Default for PVTable {
    fn default() -> Self {
        Self {
            table: [[None; MAX_DEPTH]; MAX_DEPTH],
            length: [0; MAX_DEPTH],
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
