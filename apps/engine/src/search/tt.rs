#[derive(Clone, Copy, PartialEq)]
pub enum NodeType {
    Exact,
    Alpha,
    Beta,
}

#[derive(Clone, Copy)]
pub(super) struct TranspositionTableEntry {
    pub node_type: NodeType,
    pub depth: u32,
    pub evaluation: i32,
    pub zobrist_key: u64,
}

pub(super) struct TranspositionTable {
    entries: Vec<Option<TranspositionTableEntry>>,
    size: usize,
}

impl TranspositionTable {
    pub fn new(size_mb: usize) -> Self {
        let size = (size_mb * 1024 * 1024) / std::mem::size_of::<Option<TranspositionTableEntry>>();

        Self {
            entries: vec![None; size],
            size,
        }
    }

    pub fn store(&mut self, entry: TranspositionTableEntry) {
        self.entries[(entry.zobrist_key as usize) % self.size] = Some(entry);
    }

    pub fn probe(&self, zobrist_key: u64) -> Option<&TranspositionTableEntry> {
        self.entries[(zobrist_key as usize) % self.size]
            .as_ref()
            .filter(|e| e.zobrist_key == zobrist_key)
    }
}
