pub mod magic_numbers;

mod leapers;
mod magic_bitboards;
mod sliders;

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

pub static WHITE_PAWN_ATTACKS: [u64; 64] = compute_table!(leapers::compute_white_pawn_attacks);
pub static BLACK_PAWN_ATTACKS: [u64; 64] = compute_table!(leapers::compute_black_pawn_attacks);
pub static KNIGHT_ATTACKS: [u64; 64] = compute_table!(leapers::compute_knight_attacks);
pub static KING_ATTACKS: [u64; 64] = compute_table!(leapers::compute_king_attacks);

static BISHOP_MASKS: [u64; 64] = compute_table!(sliders::mask_bishop_attacks);
static ROOK_MASKS: [u64; 64] = compute_table!(sliders::mask_rook_attacks);

static MAGIC_BISHOP_ATTACKS: [[u64; 512]; 64] =
    compute_table!(magic_bitboards::compute_bishop_magic_bitboards);
static MAGIC_ROOK_ATTACKS: [[u64; 4096]; 64] =
    compute_table!(magic_bitboards::compute_rook_magic_bitboards);

#[inline(always)]
pub fn get_bishop_attacks(square: usize, occupancy: u64) -> u64 {
    MAGIC_BISHOP_ATTACKS[square][(((occupancy & BISHOP_MASKS[square])
        .wrapping_mul(magic_numbers::BISHOP_MAGIC_NUMBERS[square]))
        >> (64 - BISHOP_MASKS[square].count_ones())) as usize]
}

#[inline(always)]
pub fn get_rook_attacks(square: usize, occupancy: u64) -> u64 {
    MAGIC_ROOK_ATTACKS[square][(((occupancy & ROOK_MASKS[square])
        .wrapping_mul(magic_numbers::ROOK_MAGIC_NUMBERS[square]))
        >> (64 - ROOK_MASKS[square].count_ones())) as usize]
}

#[inline(always)]
pub fn get_queen_attacks(square: usize, occupancy: u64) -> u64 {
    get_bishop_attacks(square, occupancy) | get_rook_attacks(square, occupancy)
}
