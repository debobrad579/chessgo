use crate::{
    compute_table,
    masks::{NOT_A, NOT_H},
};

macro_rules! compute_pawn_table {
    ($f:expr) => {{
        let mut table = [[($f)(0); 64]; 2];

        let mut i = 1;
        while i < 64 {
            table[0][i] = ($f)(i);
            i += 1;
        }

        let mut i = 1;
        while i < 64 {
            table[1][i] = ($f)(i ^ 56).swap_bytes();
            i += 1;
        }

        table
    }};
}

pub static PAWN_ATTACKS: [[u64; 64]; 2] = compute_pawn_table!(compute_pawn_attacks);
pub static PASSED_PAWN_MASKS: [[u64; 64]; 2] = compute_pawn_table!(compute_passed_pawn_mask);
pub static DOUBLED_PAWN_MASKS: [[u64; 64]; 2] = compute_pawn_table!(compute_doubled_pawn_mask);
pub static ISOLATED_PAWN_MASKS: [u64; 64] = compute_table!(compute_isolated_pawn_mask);
pub static BACKWARD_PAWN_MASKS: [[u64; 64]; 2] = compute_pawn_table!(compute_backward_pawn_mask);

pub(super) const fn compute_pawn_attacks(square: usize) -> u64 {
    let bit = 1u64 << square;
    let mut attacks = 0u64;

    attacks |= (bit & NOT_H) << 9; // north-east
    attacks |= (bit & NOT_A) << 7; // north-west

    return attacks;
}

pub(super) const fn compute_passed_pawn_mask(square: usize) -> u64 {
    let mut mask = 0u64;

    let rank = (square / 8) as i32;
    let file = (square % 8) as i32;

    let mut r = rank + 1;
    while r <= 6 {
        mask |= 1u64 << (r * 8 + file);
        r += 1;
    }

    let bit = 1u64 << square;

    if (bit & NOT_H) != 0 {
        r = rank + 1;
        while r <= 6 {
            mask |= 1u64 << (r * 8 + file + 1);
            r += 1;
        }
    }

    if (bit & NOT_A) != 0 {
        r = rank + 1;
        while r <= 6 {
            mask |= 1u64 << (r * 8 + file - 1);
            r += 1;
        }
    }

    return mask;
}

pub(super) const fn compute_doubled_pawn_mask(square: usize) -> u64 {
    let mut mask = 0u64;

    let rank = (square / 8) as i32;
    let file = (square % 8) as i32;

    let mut r = rank + 1;
    while r <= 6 {
        mask |= 1u64 << (r * 8 + file);
        r += 1;
    }

    return mask;
}

pub(super) const fn compute_isolated_pawn_mask(square: usize) -> u64 {
    let mut mask = 0u64;

    let file = (square % 8) as i32;

    let bit = 1u64 << square;

    if (bit & NOT_H) != 0 {
        let mut r = 1;
        while r <= 6 {
            mask |= 1u64 << (r * 8 + file + 1);
            r += 1;
        }
    }

    if (bit & NOT_A) != 0 {
        let mut r = 1;
        while r <= 6 {
            mask |= 1u64 << (r * 8 + file - 1);
            r += 1;
        }
    }

    return mask;
}

pub(super) const fn compute_backward_pawn_mask(square: usize) -> u64 {
    let mut mask = 0u64;

    let rank = (square / 8) as i32;
    let file = (square % 8) as i32;

    let bit = 1u64 << square;

    if (bit & NOT_H) != 0 {
        let mut r = rank;
        while r >= 1 {
            mask |= 1u64 << (r * 8 + file + 1);
            r -= 1;
        }
    }

    if (bit & NOT_A) != 0 {
        let mut r = rank;
        while r >= 1 {
            mask |= 1u64 << (r * 8 + file - 1);
            r -= 1;
        }
    }

    return mask;
}

#[cfg(test)]
mod test {
    use crate::{
        masks::pawns::{
            BACKWARD_PAWN_MASKS, DOUBLED_PAWN_MASKS, ISOLATED_PAWN_MASKS, PASSED_PAWN_MASKS,
            PAWN_ATTACKS,
        },
        types::Square,
    };

    #[test]
    fn white_pawn_attacks() {
        assert_eq!(PAWN_ATTACKS[0][Square::E4 as usize], 0x0000002800000000);
        assert_eq!(PAWN_ATTACKS[0][Square::H4 as usize], 0x0000004000000000);
        assert_eq!(PAWN_ATTACKS[0][Square::A4 as usize], 0x0000000200000000);
    }

    #[test]
    fn black_pawn_attacks() {
        assert_eq!(PAWN_ATTACKS[1][Square::E5 as usize], 0x0000000028000000);
        assert_eq!(PAWN_ATTACKS[1][Square::H5 as usize], 0x0000000040000000);
        assert_eq!(PAWN_ATTACKS[1][Square::A5 as usize], 0x0000000002000000);
    }

    #[test]
    fn white_passed_pawn_masks() {
        assert_eq!(
            PASSED_PAWN_MASKS[0][Square::E4 as usize],
            0x0038383800000000
        );
        assert_eq!(
            PASSED_PAWN_MASKS[0][Square::H4 as usize],
            0x00C0C0C000000000
        );
        assert_eq!(
            PASSED_PAWN_MASKS[0][Square::A4 as usize],
            0x0003030300000000
        );
    }

    #[test]
    fn black_passed_pawn_masks() {
        assert_eq!(
            PASSED_PAWN_MASKS[1][Square::E5 as usize],
            0x0000000038383800
        );
        assert_eq!(
            PASSED_PAWN_MASKS[1][Square::H5 as usize],
            0x00000000C0C0C000
        );
        assert_eq!(
            PASSED_PAWN_MASKS[1][Square::A5 as usize],
            0x0000000003030300
        );
    }

    #[test]
    fn white_doubled_pawn_masks() {
        assert_eq!(
            DOUBLED_PAWN_MASKS[0][Square::B2 as usize],
            0x0002020202020000
        );
    }

    #[test]
    fn black_doubled_pawn_masks() {
        assert_eq!(
            DOUBLED_PAWN_MASKS[1][Square::G7 as usize],
            0x0000404040404000
        );
    }

    #[test]
    fn isolated_pawn_masks() {
        assert_eq!(
            ISOLATED_PAWN_MASKS[Square::E4 as usize],
            0x00028282828282800
        );
        assert_eq!(
            ISOLATED_PAWN_MASKS[Square::H4 as usize],
            0x00040404040404000
        );
        assert_eq!(
            ISOLATED_PAWN_MASKS[Square::A4 as usize],
            0x00002020202020200
        );
    }

    #[test]
    fn white_backward_pawn_masks() {
        assert_eq!(
            BACKWARD_PAWN_MASKS[0][Square::E4 as usize],
            0x00000000028282800
        );
        assert_eq!(
            BACKWARD_PAWN_MASKS[0][Square::H4 as usize],
            0x00000000040404000
        );
        assert_eq!(
            BACKWARD_PAWN_MASKS[0][Square::A4 as usize],
            0x00000000002020200
        );
    }

    #[test]
    fn black_backward_pawn_masks() {
        assert_eq!(
            BACKWARD_PAWN_MASKS[1][Square::E5 as usize],
            0x0028282800000000
        );
        assert_eq!(
            BACKWARD_PAWN_MASKS[1][Square::H5 as usize],
            0x0040404000000000
        );
        assert_eq!(
            BACKWARD_PAWN_MASKS[1][Square::A5 as usize],
            0x0002020200000000
        );
    }
}
