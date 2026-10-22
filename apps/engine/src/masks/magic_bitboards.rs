use crate::{
    compute_table,
    masks::{
        BISHOP_MASKS, ROOK_MASKS,
        magic_numbers::{BISHOP_MAGIC_NUMBERS, ROOK_MAGIC_NUMBERS},
        sliders::{compute_bishop_attacks, compute_rook_attacks},
    },
};

static MAGIC_BISHOP_ATTACKS: [[u64; 512]; 64] = compute_table!(compute_bishop_magic_bitboards);
static MAGIC_ROOK_ATTACKS: [[u64; 4096]; 64] = compute_table!(compute_rook_magic_bitboards);

#[inline(always)]
pub fn get_bishop_attacks(square: usize, occupancy: u64) -> u64 {
    MAGIC_BISHOP_ATTACKS[square][(((occupancy & BISHOP_MASKS[square])
        .wrapping_mul(BISHOP_MAGIC_NUMBERS[square]))
        >> (64 - BISHOP_MASKS[square].count_ones())) as usize]
}

#[inline(always)]
pub fn get_rook_attacks(square: usize, occupancy: u64) -> u64 {
    MAGIC_ROOK_ATTACKS[square][(((occupancy & ROOK_MASKS[square])
        .wrapping_mul(ROOK_MAGIC_NUMBERS[square]))
        >> (64 - ROOK_MASKS[square].count_ones())) as usize]
}

#[inline(always)]
pub fn get_queen_attacks(square: usize, occupancy: u64) -> u64 {
    get_bishop_attacks(square, occupancy) | get_rook_attacks(square, occupancy)
}

pub(super) const fn compute_bishop_magic_bitboards(square: usize) -> [u64; 512] {
    let mut attacks = [0u64; 512];
    let attack_mask = BISHOP_MASKS[square];
    let relevant_bits = attack_mask.count_ones();
    let magic_number = BISHOP_MAGIC_NUMBERS[square];

    let mut subset = attack_mask;
    loop {
        let magic_index = (subset.wrapping_mul(magic_number)) >> (64 - relevant_bits);
        attacks[magic_index as usize] = compute_bishop_attacks(square, subset);

        if subset == 0 {
            break;
        }

        subset = (subset - 1) & attack_mask;
    }

    return attacks;
}

pub(super) const fn compute_rook_magic_bitboards(square: usize) -> [u64; 4096] {
    let mut attacks = [0u64; 4096];
    let attack_mask = ROOK_MASKS[square];
    let relevant_bits = attack_mask.count_ones();
    let magic_number = ROOK_MAGIC_NUMBERS[square];

    let mut subset = attack_mask;
    loop {
        let magic_index = (subset.wrapping_mul(magic_number)) >> (64 - relevant_bits);
        attacks[magic_index as usize] = compute_rook_attacks(square, subset);

        if subset == 0 {
            break;
        }

        subset = (subset - 1) & attack_mask;
    }

    return attacks;
}

#[cfg(test)]
mod test {
    use crate::{
        masks::magic_bitboards::{get_bishop_attacks, get_queen_attacks, get_rook_attacks},
        types::Square,
    };

    #[test]
    fn bishop_attacks() {
        assert_eq!(
            get_bishop_attacks(Square::E4 as usize, 0x0000440000004400),
            0x0000442800284400
        );
        assert_eq!(
            get_bishop_attacks(Square::B2 as usize, 0x0040000000000000),
            0x0040201008050005
        );
        assert_eq!(
            get_bishop_attacks(Square::C4 as usize, 0x0020000200000000),
            0x0020100A000A1120
        );
        assert_eq!(
            get_bishop_attacks(Square::F8 as usize, 0x0040000002000000),
            0x0050080402000000
        );
    }

    #[test]
    fn rook_attacks() {
        assert_eq!(
            get_rook_attacks(Square::A1 as usize, 0x0000000100000010),
            0x000000010101011E
        );
        assert_eq!(
            get_rook_attacks(Square::E4 as usize, 0x0000100020000000),
            0x000010102F101010
        );
        assert_eq!(
            get_rook_attacks(Square::F8 as usize, 0x4000000020000000),
            0x5F20202020000000
        );
        assert_eq!(
            get_rook_attacks(Square::C2 as usize, 0x0000000400002204),
            0x0000000404043A04
        );
    }

    #[test]
    fn queen_attacks() {
        assert_eq!(
            get_queen_attacks(Square::E4 as usize, 0x0000000000000000),
            0x11925438EF385492
        );
        assert_eq!(
            get_queen_attacks(Square::C3 as usize, 0x0000001000200400),
            0x040404150E3B0E11
        );
        assert_eq!(
            get_queen_attacks(Square::A5 as usize, 0xF7F304000804E7F7),
            0x080503FE03050100
        );
        assert_eq!(
            get_queen_attacks(Square::D1 as usize, 0xBDF3240C2834E3B3),
            0x00000000092A1C16
        );
    }
}
