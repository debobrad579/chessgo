use crate::{
    position::Position,
    search::{MAX_PLY, Search},
};

impl Search {
    pub fn negamax(
        &mut self,
        position: &mut Position,
        depth: u32,
        mut alpha: i32,
        beta: i32,
        ply: usize,
    ) -> i32 {
        self.init_pv_ply(ply);

        if position.half_moves >= 100 {
            return 0;
        }

        if depth == 0 {
            return self.quiescence(position, alpha, beta);
        }

        if ply >= MAX_PLY {
            return position.evaluation(position.turn);
        }

        let mut moves = position.generate_pseudolegal_moves(position.turn);
        self.sort_moves(&mut moves, position.turn, ply);

        let mut legal_move_count = 0;

        for mv in moves {
            let undo = position.make_move(mv);
            if position.in_check(!position.turn) {
                position.undo_move(mv, undo);
                continue;
            }

            legal_move_count += 1;
            let evaluation = -self.negamax(position, depth - 1, -beta, -alpha, ply + 1);
            position.undo_move(mv, undo);

            if evaluation >= beta {
                if mv.capture().is_none() {
                    self.killer_moves[ply][1] = self.killer_moves[ply][0];
                    self.killer_moves[ply][0] = Some(mv);
                    self.history_moves[position.turn][mv.source() as usize]
                        [mv.target() as usize] += depth * depth;
                }

                return beta;
            }

            if evaluation > alpha {
                alpha = evaluation;
                self.update_pv(ply, mv);
            }
        }

        if legal_move_count == 0 {
            return if position.in_check(position.turn) {
                -1_000_000_000 - (ply as i32)
            } else {
                0
            };
        }

        alpha
    }
}

#[cfg(test)]
mod test {
    use crate::position::{Position, fen::FENError};

    #[test]
    fn mate_in_one_1() -> Result<(), FENError> {
        let mut position =
            Position::try_from("1rb5/4r3/3p1npb/3kp1P1/1P3P1P/5nR1/2Q1BK2/bN4NR w - - 3 61")?;
        let mv = position.search(2);

        assert_eq!(mv.source(), 10);
        assert_eq!(mv.target(), 26);

        Ok(())
    }

    #[test]
    fn mate_in_one_2() -> Result<(), FENError> {
        let mut position = Position::try_from(
            "rn1q2n1/b3k1pr/pp1pB1Qp/2p1p1P1/2P1PP2/5R1P/P2P4/RNB1K3 w - - 1 24",
        )?;
        let mv = position.search(2);

        assert_eq!(mv.source(), 46);
        assert_eq!(mv.target(), 53);

        Ok(())
    }

    #[test]
    fn mate_in_one_3() -> Result<(), FENError> {
        let mut position =
            Position::try_from("8/3r3k/NP1p4/p2QP1P1/1BB3Pp/1R4n1/6K1/5R2 w - - 5 82")?;
        let mv = position.search(2);

        assert_eq!(mv.source(), 35);
        assert_eq!(mv.target(), 62);

        Ok(())
    }

    #[test]
    fn morphy_mate_in_two() -> Result<(), FENError> {
        let mut position = Position::try_from("kbK5/pp6/1P6/8/8/8/8/R7 w - - 0 1")?;
        let mv = position.search(4);

        assert_eq!(mv.source(), 0);
        assert_eq!(mv.target(), 40);

        Ok(())
    }

    #[test]
    fn long_castle_mate() -> Result<(), FENError> {
        let mut position = Position::try_from("8/8/8/2P3R1/5B2/2rP1p2/p1P1PP2/RnQ1K2k w Q - 5 3")?;
        let mv = position.search(4);

        assert_eq!(mv.source(), 2);
        assert_eq!(mv.target(), 9);

        Ok(())
    }

    #[test]
    fn avoid_stalemate() -> Result<(), FENError> {
        let mut position = Position::try_from("8/8/2Q5/3B4/1K6/2P5/Nk6/2R5 w - - 0 1")?;
        let mv = position.search(4);

        assert_eq!(mv.source(), 35);
        assert_eq!(mv.target(), 7);

        Ok(())
    }
}
