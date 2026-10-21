pub const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
pub const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;
pub const NOT_AB: u64 = 0xFCFCFCFCFCFCFCFC;
pub const NOT_GH: u64 = 0x3F3F3F3F3F3F3F3F;

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

#[cfg(test)]
mod test {
    use crate::attacks::{DOUBLED_PAWN_MASKS, ISOLATED_PAWN_MASKS, PASSED_PAWN_MASKS};

    #[test]
    fn white_passed_pawn_masks() {
        assert_eq!(PASSED_PAWN_MASKS[0][28], 0x0038383800000000); // e4
        assert_eq!(PASSED_PAWN_MASKS[0][31], 0x00C0C0C000000000); // h4
        assert_eq!(PASSED_PAWN_MASKS[0][24], 0x0003030300000000); // a4
    }

    #[test]
    fn black_passed_pawn_masks() {
        assert_eq!(PASSED_PAWN_MASKS[1][36], 0x0000000038383800); // e5
        assert_eq!(PASSED_PAWN_MASKS[1][39], 0x00000000C0C0C000); // h5
        assert_eq!(PASSED_PAWN_MASKS[1][32], 0x0000000003030300); // a5
    }

    #[test]
    fn white_doubled_pawn_masks() {
        assert_eq!(DOUBLED_PAWN_MASKS[0][9], 0x0002020202020000); // b2
    }

    #[test]
    fn black_doubled_pawn_masks() {
        assert_eq!(DOUBLED_PAWN_MASKS[1][54], 0x0000404040404000); // g7
    }

    #[test]
    fn isolated_pawn_masks() {
        assert_eq!(ISOLATED_PAWN_MASKS[28], 0x00028282828282800); // e4
        assert_eq!(ISOLATED_PAWN_MASKS[31], 0x00040404040404000); // h4
        assert_eq!(ISOLATED_PAWN_MASKS[24], 0x00002020202020200); // a4
    }
}
