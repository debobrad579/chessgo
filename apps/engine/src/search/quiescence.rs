use crate::{position::Position, search::Search};

impl Search {
    pub fn quiescence(&mut self, position: &mut Position, mut alpha: i32, beta: i32) -> i32 {
        self.nodes += 1;

        let stand_pat = position.evaluation(position.turn());
        if stand_pat >= beta {
            return beta;
        }

        alpha = alpha.max(stand_pat);

        let mut captures = position.generate_pseudolegal_captures();
        self.sort_moves(&mut captures, position.turn(), 0);

        for capture in captures {
            let undo = position.make_move(capture);
            if position.in_check(!position.turn()) {
                position.undo_move(capture, undo);
                continue;
            }

            let evaluation = -self.quiescence(position, -beta, -alpha);
            position.undo_move(capture, undo);

            if evaluation >= beta {
                return beta;
            }

            alpha = alpha.max(evaluation);
        }

        alpha
    }
}
