#[derive(Clone, Copy, Debug, PartialEq)]
pub(in crate::position) struct Entry {
    pub zobrist_key: u64,
    pub evaluation: i32,
}

#[derive(Clone, Debug, PartialEq)]
pub(in crate::position) struct PawnHashTable {
    entries: Vec<Option<Entry>>,
    size: usize,
}

impl Default for PawnHashTable {
    fn default() -> Self {
        PawnHashTable::new(64)
    }
}

impl PawnHashTable {
    pub fn new(size_kb: usize) -> Self {
        let size = (size_kb * 1024) / std::mem::size_of::<Option<Entry>>();

        Self {
            entries: vec![None; size],
            size,
        }
    }

    pub fn store(&mut self, entry: Entry) {
        self.entries[(entry.zobrist_key as usize) % self.size] = Some(entry);
    }

    pub fn probe(&self, zobrist_key: u64) -> Option<&Entry> {
        self.entries[(zobrist_key as usize) % self.size]
            .as_ref()
            .filter(|e| e.zobrist_key == zobrist_key)
    }
}

#[cfg(test)]
mod test {
    use crate::{
        position::{Position, hash::PawnHashKey},
        types::{Color, Move},
    };

    fn starting_pawn_key() -> PawnHashKey {
        let mut key = PawnHashKey::default();
        for file in 0..8 {
            key.toggle_pawn(8 + file, Color::White);
            key.toggle_pawn(48 + file, Color::Black);
        }
        key
    }

    fn get_move(position: &Position, source: u32, target: u32) -> Move {
        *position
            .generate_pseudolegal_moves()
            .iter()
            .find(|mv| mv.source() == source && mv.target() == target)
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

        let mv = get_move(position, 12, 28); // e2 to e4

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

        position.make_move(get_move(position, 12, 28)); // e2 to e4
        position.make_move(get_move(position, 51, 35)); // d7 to d5
        position.make_move(get_move(position, 28, 35)); // e4 takes d5

        let mv = get_move(position, 59, 35); // d8 takes d5
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

        position.make_move(get_move(position, 12, 28)); // e2 to e4
        position.make_move(get_move(position, 51, 35)); // d7 to d5
        position.make_move(get_move(position, 28, 36)); // e4 to e5
        position.make_move(get_move(position, 53, 37)); // f7 to f5

        let mv = get_move(position, 36, 45); // e5 takes f6
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
