use crate::position::Position;

mod make;
mod pseudolegal;
mod unmake;

pub fn perft(position: &mut Position, depth: u32) -> u64 {
    if depth == 0 {
        return 1;
    }

    let moves = position.generate_pseudolegal_moves();
    let mut result = 0;

    for mv in moves {
        let undo = position.make_move(mv);
        if !position.in_check(!position.turn) {
            result += perft(position, depth - 1);
        }
        position.undo_move(mv, undo);
    }

    result
}
