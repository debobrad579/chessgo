use crate::masks::sliders::{BISHOP_MASKS, ROOK_MASKS};

pub mod leapers;
pub mod magic_bitboards;
pub mod magic_numbers;
pub mod pawns;
pub mod sliders;

pub const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
pub const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;
pub const NOT_AB: u64 = 0xFCFCFCFCFCFCFCFC;
pub const NOT_GH: u64 = 0x3F3F3F3F3F3F3F3F;

#[macro_export]
macro_rules! compute_table {
    ($f:expr) => {{
        let mut table = [($f)(0); 64];

        let mut i = 1;
        while i < 64 {
            table[i] = ($f)(i);
            i += 1;
        }

        table
    }};
}
