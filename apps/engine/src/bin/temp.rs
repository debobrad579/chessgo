use engine::board::{Board, BoardError, Color};

fn main() -> Result<(), BoardError> {
    let b = Board::try_from("rnbqkbnr/pppp1ppp/8/4p3/3P4/2N5/PPP1PPPP/R1BQKBNR b KQkq - 0 2")?;
    println!("{}", b.generate_pseudolegal_moves(Color::Black).len());

    Ok(())
}
