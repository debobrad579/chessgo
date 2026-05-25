use crate::{search::Search, types::Move};

impl Search {
    pub fn init_pv_ply(&mut self, ply: usize) {
        self.pv_length[ply] = ply;
    }

    pub fn update_pv(&mut self, ply: usize, mv: Move) {
        self.pv_table[ply][ply] = Some(mv);

        for next_ply in (ply + 1)..self.pv_length[ply + 1] {
            self.pv_table[ply][next_ply] = self.pv_table[ply + 1][next_ply];
        }

        self.pv_length[ply] = self.pv_length[ply + 1];
    }

    pub fn best_move(&self) -> Option<Move> {
        self.pv_table[0][0]
    }
}
