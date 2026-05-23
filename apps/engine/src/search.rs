use crate::{moves::Move, state::State};

impl State {
    pub fn negamax(&mut self, depth: u32, ply: usize, mut alpha: i32, beta: i32) -> i32 {
        if depth == 0 {
            return self.quiescence_search(alpha, beta);
        }

        let mut moves = self.generate_pseudolegal_moves(self.turn);
        self.sort_moves(&mut moves, ply);

        let mut legal_move_count = 0;

        for mv in moves {
            let undo = self.make_move(mv);
            if self.in_check(!self.turn) {
                self.undo_move(mv, undo);
                continue;
            }

            legal_move_count += 1;
            let evaluation = -self.negamax(depth - 1, ply + 1, -beta, -alpha);
            self.undo_move(mv, undo);

            if evaluation >= beta {
                if mv.capture().is_none() {
                    self.killer_moves[ply][1] = self.killer_moves[ply][0];
                    self.killer_moves[ply][0] = Some(mv);
                }

                return beta;
            }

            alpha = alpha.max(evaluation);
        }

        if legal_move_count == 0 {
            return if self.in_check(self.turn) {
                -1_000_000_000
            } else {
                0
            };
        }

        alpha
    }

    pub fn quiescence_search(&mut self, mut alpha: i32, beta: i32) -> i32 {
        let stand_pat = self.evaluation(self.turn);
        if stand_pat >= beta {
            return beta;
        }

        alpha = alpha.max(stand_pat);

        let mut captures = self.generate_pseudolegal_captures(self.turn);
        self.sort_moves(&mut captures, 0);

        for capture in captures {
            let undo = self.make_move(capture);
            if self.in_check(!self.turn) {
                self.undo_move(capture, undo);
                continue;
            }

            let evaluation = -self.quiescence_search(-beta, -alpha);
            self.undo_move(capture, undo);

            if evaluation >= beta {
                return beta;
            }

            alpha = alpha.max(evaluation);
        }

        alpha
    }

    pub fn get_best_move(&mut self, depth: u32) -> Move {
        let mut moves = self.generate_pseudolegal_moves(self.turn);
        self.sort_moves(&mut moves, self.ply as usize);

        let mut best_score = -1_000_000_000;
        let mut best_move = None;

        for mv in moves {
            let undo = self.make_move(mv);
            if self.in_check(!self.turn) {
                self.undo_move(mv, undo);
                continue;
            }

            let score = -self.negamax(
                depth - 1,
                (self.ply + 1) as usize,
                -1_000_000_000,
                1_000_000_000,
            );
            self.undo_move(mv, undo);

            if score > best_score {
                best_score = score;
                best_move = Some(mv);
            }
        }

        best_move.expect("no legal moves")
    }
}
