use crate::{
    position::Position,
    search::{
        MATE_SCORE, MAX_PLY, Search,
        tt::{NodeType, TranspositionTableEntry},
    },
};

const MATE_THRESHOLD: i32 = MATE_SCORE - MAX_PLY as i32;

fn score_to_tt(score: i32, ply: usize) -> i32 {
    if score >= MATE_THRESHOLD {
        score + ply as i32
    } else if score <= -MATE_THRESHOLD {
        score - ply as i32
    } else {
        score
    }
}

fn score_from_tt(score: i32, ply: usize) -> i32 {
    if score >= MATE_THRESHOLD {
        score - ply as i32
    } else if score <= -MATE_THRESHOLD {
        score + ply as i32
    } else {
        score
    }
}

impl Search {
    pub fn negamax(
        &mut self,
        position: &mut Position,
        depth: u32,
        mut alpha: i32,
        beta: i32,
        ply: usize,
    ) -> i32 {
        if self.stopped() {
            return 0;
        }

        self.nodes += 1;
        self.init_pv_ply(ply);

        if ply > 0 && position.is_draw() {
            return 0;
        }

        if ply >= MAX_PLY {
            return position.evaluation(position.turn());
        }

        if depth == 0 {
            return self.quiescence(position, alpha, beta);
        }

        if ply > 0
            && let Some(entry) = self.tt.probe(position.zobrist_key())
            && entry.depth >= depth
        {
            let eval = score_from_tt(entry.evaluation, ply);
            match entry.node_type {
                NodeType::Exact => return eval.clamp(alpha, beta),
                NodeType::Beta => {
                    if eval >= beta {
                        return beta;
                    }
                }
                NodeType::Alpha => {
                    if eval <= alpha {
                        return alpha;
                    }
                }
            }
        }

        let mut moves = position.generate_pseudolegal_moves();

        self.sort_moves(&mut moves, position.turn(), ply);

        let mut legal_move_count = 0;
        let original_alpha = alpha;

        for mv in moves {
            let undo = position.make_move(mv);
            if position.in_check(!position.turn()) {
                position.undo_move(mv, undo);
                continue;
            }

            let evaluation = if legal_move_count == 0 {
                -self.negamax(position, depth - 1, -beta, -alpha, ply + 1)
            } else {
                let nws = -self.negamax(position, depth - 1, -alpha - 1, -alpha, ply + 1);
                if nws > alpha && nws < beta {
                    -self.negamax(position, depth - 1, -beta, -alpha, ply + 1)
                } else {
                    nws
                }
            };

            position.undo_move(mv, undo);

            if self.stopped() {
                return 0;
            }

            legal_move_count += 1;

            if evaluation >= beta {
                if mv.capture().is_none() {
                    self.killer_moves[ply][1] = self.killer_moves[ply][0];
                    self.killer_moves[ply][0] = Some(mv);
                    self.history_moves[position.turn()][mv.source() as usize]
                        [mv.target() as usize] += depth * depth;
                }

                self.tt.store(TranspositionTableEntry {
                    zobrist_key: position.zobrist_key(),
                    depth,
                    evaluation: score_to_tt(beta, ply),
                    node_type: NodeType::Beta,
                });

                return beta;
            }

            if evaluation > alpha {
                alpha = evaluation;
                self.update_pv(ply, mv);
            }
        }

        if legal_move_count == 0 {
            return if position.in_check(position.turn()) {
                -MATE_SCORE + (ply as i32)
            } else {
                0
            };
        }

        self.tt.store(TranspositionTableEntry {
            zobrist_key: position.zobrist_key(),
            depth,
            evaluation: score_to_tt(alpha, ply),
            node_type: if alpha > original_alpha {
                NodeType::Exact
            } else {
                NodeType::Alpha
            },
        });

        alpha
    }
}

#[cfg(test)]
mod test {
    use crate::{
        position::{Position, fen::FENError},
        search::Search,
        types::Move,
    };

    fn search(position: &mut Position, depth: u32) -> Move {
        let mut search = Search::default();
        search.negamax(position, depth, -2_000_000_000, 2_000_000_000, 0);
        search.bestmove().unwrap()
    }

    #[test]
    fn mate_in_one_1() -> Result<(), FENError> {
        let mut position =
            Position::try_from("1rb5/4r3/3p1npb/3kp1P1/1P3P1P/5nR1/2Q1BK2/bN4NR w - - 3 61")?;
        let mv = search(&mut position, 2);

        assert_eq!(mv.source(), 10);
        assert_eq!(mv.target(), 26);

        Ok(())
    }

    #[test]
    fn mate_in_one_2() -> Result<(), FENError> {
        let mut position = Position::try_from(
            "rn1q2n1/b3k1pr/pp1pB1Qp/2p1p1P1/2P1PP2/5R1P/P2P4/RNB1K3 w - - 1 24",
        )?;
        let mv = search(&mut position, 2);

        assert_eq!(mv.source(), 46);
        assert_eq!(mv.target(), 53);

        Ok(())
    }

    #[test]
    fn mate_in_one_3() -> Result<(), FENError> {
        let mut position =
            Position::try_from("8/3r3k/NP1p4/p2QP1P1/1BB3Pp/1R4n1/6K1/5R2 w - - 5 82")?;
        let mv = search(&mut position, 2);

        assert_eq!(mv.source(), 35);
        assert_eq!(mv.target(), 62);

        Ok(())
    }

    #[test]
    fn morphy_mate_in_two() -> Result<(), FENError> {
        let mut position = Position::try_from("kbK5/pp6/1P6/8/8/8/8/R7 w - - 0 1")?;
        let mv = search(&mut position, 4);

        assert_eq!(mv.source(), 0);
        assert_eq!(mv.target(), 40);

        Ok(())
    }

    #[test]
    fn long_castle_mate() -> Result<(), FENError> {
        let mut position = Position::try_from("8/8/8/2P3R1/5B2/2rP1p2/p1P1PP2/RnQ1K2k w Q - 5 3")?;
        let mv = search(&mut position, 4);

        assert_eq!(mv.source(), 2);
        assert_eq!(mv.target(), 9);

        Ok(())
    }

    #[test]
    fn avoid_stalemate() -> Result<(), FENError> {
        let mut position = Position::try_from("8/8/2Q5/3B4/1K6/2P5/Nk6/2R5 w - - 0 1")?;
        let mv = search(&mut position, 4);

        assert_eq!(mv.source(), 35);
        assert_eq!(mv.target(), 7);

        Ok(())
    }
}
