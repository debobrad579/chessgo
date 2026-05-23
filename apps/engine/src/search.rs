use crate::{move_ordering::sort_moves, moves::Move, state::State};

impl State {
    pub fn negamax(&mut self, depth: u32, mut alpha: i32, beta: i32) -> i32 {
        if depth == 0 {
            return self.quiescence_search(alpha, beta);
        }

        let moves = self.generate_pseudolegal_moves(self.turn);
        let mut legal_move_count = 0;

        for mv in moves {
            let undo = self.make_move(mv);
            if self.in_check(!self.turn) {
                self.undo_move(mv, undo);
                continue;
            }

            legal_move_count += 1;
            let evaluation = -self.negamax(depth - 1, -beta, -alpha);
            self.undo_move(mv, undo);

            if evaluation >= beta {
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
        sort_moves(&mut captures);

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
        sort_moves(&mut moves);

        let mut best_score = -1_000_000_000;
        let mut best_move = None;

        for mv in moves {
            let undo = self.make_move(mv);
            if self.in_check(!self.turn) {
                self.undo_move(mv, undo);
                continue;
            }

            let score = -self.negamax(depth - 1, -1_000_000_000, 1_000_000_000);
            self.undo_move(mv, undo);

            if score > best_score {
                best_score = score;
                best_move = Some(mv);
            }
        }

        best_move.expect("no legal moves")
    }
}
