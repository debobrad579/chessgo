use std::cmp::max;

use crate::{moves::Move, state::State};

impl State {
    pub fn search(&self, depth: u32, mut alpha: i32, beta: i32) -> i32 {
        if depth == 0 {
            return self.evaluate(self.turn);
        }

        let moves = self.get_legal_moves();
        if moves.is_empty() {
            return if self.in_check(self.turn) {
                -1000000000
            } else {
                0
            };
        }

        for mv in moves {
            let mut new_board = *self;
            new_board.make_move(mv);

            let evaluation = -new_board.search(depth - 1, -beta, -alpha);
            if evaluation >= beta {
                return beta;
            }

            alpha = max(alpha, evaluation);
        }

        alpha
    }

    pub fn get_best_move(&self, depth: u32) -> Move {
        let moves = self.get_legal_moves();

        let mut best_score = -1000000000;
        let mut best_move = moves[0];

        for mv in moves {
            let mut new_board = *self;
            new_board.make_move(mv);

            let score = -new_board.search(depth - 1, -1000000000, 1000000000);

            if score > best_score {
                best_score = score;
                best_move = mv;
            }
        }

        best_move
    }
}
