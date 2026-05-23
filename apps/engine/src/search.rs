use crate::{moves::Move, state::State};

impl State {
    pub fn negamax(&mut self, depth: u32, mut alpha: i32, beta: i32) -> i32 {
        if depth == 0 {
            return self.quiescence_search(alpha, beta);
        }

        let mut moves = self.generate_pseudolegal_moves(self.turn);
        self.sort_moves(&mut moves);

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
                if mv.capture().is_none() {
                    self.killer_moves[self.ply as usize][1] =
                        self.killer_moves[self.ply as usize][0];
                    self.killer_moves[self.ply as usize][0] = Some(mv);
                    self.history_moves[self.turn][mv.source() as usize][mv.target() as usize] +=
                        depth * depth;
                }

                return beta;
            }

            alpha = alpha.max(evaluation);
        }

        if legal_move_count == 0 {
            return if self.in_check(self.turn) {
                -1_000_000_000 - (self.ply as i32)
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
        self.sort_moves(&mut captures);

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
        self.sort_moves(&mut moves);

        let mut best_score = -2_000_000_000;
        let mut best_move = None;

        for mv in moves {
            let undo = self.make_move(mv);
            if self.in_check(!self.turn) {
                self.undo_move(mv, undo);
                continue;
            }

            let score = -self.negamax(depth - 1, -2_000_000_000, 2_000_000_000);
            self.undo_move(mv, undo);

            if score > best_score {
                best_score = score;
                best_move = Some(mv);
            }
        }

        best_move.expect("no legal moves")
    }
}

#[cfg(test)]
mod test {
    use crate::{fen::FENError, state::State};

    #[test]
    fn mate_in_one_1() -> Result<(), FENError> {
        let mut state =
            State::try_from("1rb5/4r3/3p1npb/3kp1P1/1P3P1P/5nR1/2Q1BK2/bN4NR w - - 3 61")?;
        let mv = state.get_best_move(2);

        assert_eq!(mv.source(), 10);
        assert_eq!(mv.target(), 26);

        Ok(())
    }

    #[test]
    fn mate_in_one_2() -> Result<(), FENError> {
        let mut state =
            State::try_from("rn1q2n1/b3k1pr/pp1pB1Qp/2p1p1P1/2P1PP2/5R1P/P2P4/RNB1K3 w - - 1 24")?;
        let mv = state.get_best_move(2);

        assert_eq!(mv.source(), 46);
        assert_eq!(mv.target(), 53);

        Ok(())
    }

    #[test]
    fn mate_in_one_3() -> Result<(), FENError> {
        let mut state = State::try_from("8/3r3k/NP1p4/p2QP1P1/1BB3Pp/1R4n1/6K1/5R2 w - - 5 82")?;
        let mv = state.get_best_move(2);

        assert_eq!(mv.source(), 35);
        assert_eq!(mv.target(), 62);

        Ok(())
    }

    #[test]
    fn morphy_mate_in_two() -> Result<(), FENError> {
        let mut state = State::try_from("kbK5/pp6/1P6/8/8/8/8/R7 w - - 0 1")?;
        let mv = state.get_best_move(4);

        assert_eq!(mv.source(), 0);
        assert_eq!(mv.target(), 40);

        Ok(())
    }

    #[test]
    fn long_castle_mate() -> Result<(), FENError> {
        let mut state = State::try_from("8/8/8/2P3R1/5B2/2rP1p2/p1P1PP2/RnQ1K2k w Q - 5 3")?;
        let mv = state.get_best_move(4);

        assert_eq!(mv.source(), 2);
        assert_eq!(mv.target(), 9);

        Ok(())
    }

    #[test]
    fn avoid_stalemate() -> Result<(), FENError> {
        let mut state = State::try_from("8/8/2Q5/3B4/1K6/2P5/Nk6/2R5 w - - 0 1")?;
        let mv = state.get_best_move(4);

        assert_eq!(mv.source(), 35);
        assert_eq!(mv.target(), 7);

        Ok(())
    }
}
