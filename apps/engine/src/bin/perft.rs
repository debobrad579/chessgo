use engine::{
    board::{Board, BoardError},
    perft::{benchmark, perft},
};

fn main() -> Result<(), BoardError> {
    let board = Board::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;

    benchmark("start pos depth 6", || perft(&board, 6));

    Ok(())
}
