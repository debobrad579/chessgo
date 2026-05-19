use engine::board::Board;

fn main() {
    let b = Board::try_from("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1").unwrap();
    b.generate_white_moves();
}
