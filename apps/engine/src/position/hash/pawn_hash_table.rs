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
