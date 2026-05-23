use std::cmp::max;

use crate::{moves::Move, state::State};

impl State {
    pub fn negamax(&self, depth: u32, mut alpha: i32, beta: i32) -> i32 {
        if depth == 0 {
            return self.quiescence_search(alpha, beta);
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

            let evaluation = -new_board.negamax(depth - 1, -beta, -alpha);
            if evaluation >= beta {
                return beta;
            }

            alpha = max(alpha, evaluation);
        }

        alpha
    }

    pub fn quiescence_search(&self, mut alpha: i32, beta: i32) -> i32 {
        let stand_pat = self.evaluate(self.turn) - self.evaluate(!self.turn);
        if stand_pat >= beta {
            return beta;
        }

        alpha = max(alpha, stand_pat);

        let captures = self.get_legal_captures();
        for capture in captures {
            let mut new_board = *self;
            new_board.make_move(capture);

            let evaluation = -new_board.quiescence_search(-beta, -alpha);
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

            let score = -new_board.negamax(depth - 1, -1000000000, 1000000000);

            if score > best_score {
                best_score = score;
                best_move = mv;
            }
        }

        best_move
    }
}
