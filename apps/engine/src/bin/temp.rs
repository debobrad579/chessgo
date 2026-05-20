use engine::board::Board;

fn main() {
    let b = Board::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").unwrap();
    println!("{}", b.generate_white_moves().len());
}
