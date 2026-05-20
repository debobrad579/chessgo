use engine::board::{Board, BoardError};

fn main() -> Result<(), BoardError> {
    let b = Board::try_from("8/8/8/8/8/8/1r6/K7 w - - 0 1")?;
    let legal_moves = b.get_legal_moves();
    println!("{}", legal_moves.len());
    for m in legal_moves {
        println!("{:?} {} {}", m.piece(), m.source(), m.target());
    }

    Ok(())
}
