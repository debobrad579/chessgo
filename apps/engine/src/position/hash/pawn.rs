use crate::{
    position::hash::keys::PIECE_KEYS,
    types::{Color, Piece},
};

#[derive(Clone, Copy, PartialEq, Default, Debug)]
pub struct PawnHashKey(u64);

impl PawnHashKey {
    pub fn value(&self) -> u64 {
        self.0
    }

    pub fn toggle_pawn(&mut self, square: u32, color: Color) {
        self.0 ^= PIECE_KEYS[square as usize][color as usize][Piece::Pawn as usize];
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub(in crate::position) struct PawnHashTableEntry {
    pub zobrist_key: u64,
    pub evaluation: i32,
}

#[derive(Clone, Debug, PartialEq)]
pub(in crate::position) struct PawnHashTable {
    entries: Vec<Option<PawnHashTableEntry>>,
    size: usize,
}

impl Default for PawnHashTable {
    fn default() -> Self {
        PawnHashTable::new(64)
    }
}

impl PawnHashTable {
    pub fn new(size_kb: usize) -> Self {
        let size = (size_kb * 1024) / std::mem::size_of::<Option<PawnHashTableEntry>>();

        Self {
            entries: vec![None; size],
            size,
        }
    }

    pub fn store(&mut self, entry: PawnHashTableEntry) {
        self.entries[(entry.zobrist_key as usize) % self.size] = Some(entry);
    }

    pub fn probe(&self, zobrist_key: u64) -> Option<&PawnHashTableEntry> {
        self.entries[(zobrist_key as usize) % self.size]
            .as_ref()
            .filter(|e| e.zobrist_key == zobrist_key)
    }
}

#[cfg(test)]
mod test {
    use crate::{
        position::{Position, hash::pawn::PawnHashKey},
        types::{Color, Move, Square},
    };

    fn starting_pawn_key() -> PawnHashKey {
        let mut key = PawnHashKey::default();
        for file in 0..8 {
            key.toggle_pawn(8 + file, Color::White);
            key.toggle_pawn(48 + file, Color::Black);
        }
        key
    }

    fn get_move(position: &Position, source: Square, target: Square) -> Move {
        *position
            .generate_pseudolegal_moves()
            .iter()
            .find(|mv| mv.source() == source as u32 && mv.target() == target as u32)
            .unwrap()
    }

    #[test]
    fn initial_position_pawn_hash() {
        let position =
            &mut Position::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
                .unwrap();

        assert_eq!(position.pawn_hash_key, starting_pawn_key());
    }

    #[test]
    fn e4_pawn_hash() {
        let position =
            &mut Position::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
                .unwrap();

        let mv = get_move(position, Square::E2, Square::E4);

        let undo = position.make_move(mv);

        let mut hash = starting_pawn_key();
        hash.toggle_pawn(12, Color::White);
        hash.toggle_pawn(28, Color::White);

        assert_eq!(position.pawn_hash_key, hash);

        position.undo_move(mv, undo);

        assert_eq!(position.pawn_hash_key, starting_pawn_key());
    }

    #[test]
    fn scandi_pawn_hash() {
        let position =
            &mut Position::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
                .unwrap();

        position.make_move(get_move(position, Square::E2, Square::E4));
        position.make_move(get_move(position, Square::D7, Square::D5));
        position.make_move(get_move(position, Square::E4, Square::D5));

        let mv = get_move(position, Square::D8, Square::D5);
        let undo = position.make_move(mv);

        let mut hash = starting_pawn_key();
        hash.toggle_pawn(12, Color::White);
        hash.toggle_pawn(51, Color::Black);

        assert_eq!(position.pawn_hash_key, hash);

        position.undo_move(mv, undo);

        let mut hash = starting_pawn_key();
        hash.toggle_pawn(12, Color::White);
        hash.toggle_pawn(51, Color::Black);
        hash.toggle_pawn(35, Color::White);

        assert_eq!(position.pawn_hash_key, hash);
    }

    #[test]
    fn enpassant_pawn_hash() {
        let position =
            &mut Position::try_from("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
                .unwrap();

        position.make_move(get_move(position, Square::E2, Square::E4));
        position.make_move(get_move(position, Square::D7, Square::D5));
        position.make_move(get_move(position, Square::E4, Square::E5));
        position.make_move(get_move(position, Square::F7, Square::F5));

        let mv = get_move(position, Square::E5, Square::F6);
        let undo = position.make_move(mv);

        let mut hash = starting_pawn_key();
        hash.toggle_pawn(12, Color::White);
        hash.toggle_pawn(51, Color::Black);
        hash.toggle_pawn(35, Color::Black);
        hash.toggle_pawn(53, Color::Black);
        hash.toggle_pawn(45, Color::White);

        assert_eq!(position.pawn_hash_key, hash);

        position.undo_move(mv, undo);

        let mut hash = starting_pawn_key();
        hash.toggle_pawn(12, Color::White);
        hash.toggle_pawn(36, Color::White);
        hash.toggle_pawn(51, Color::Black);
        hash.toggle_pawn(35, Color::Black);
        hash.toggle_pawn(53, Color::Black);
        hash.toggle_pawn(37, Color::Black);

        assert_eq!(position.pawn_hash_key, hash);
    }
}
