pub(super) const fn mask_bishop_attacks(square: usize) -> u64 {
    let mut attacks = 0u64;

    let rank = (square / 8) as i32;
    let file = (square % 8) as i32;

    // north-east
    let mut r = rank + 1;
    let mut f = file + 1;
    while r <= 6 && f <= 6 {
        attacks |= 1u64 << (r * 8 + f);
        r += 1;
        f += 1;
    }

    // north-west
    r = rank + 1;
    f = file - 1;
    while r <= 6 && f >= 1 {
        attacks |= 1u64 << (r * 8 + f);
        r += 1;
        f -= 1;
    }

    // south-east
    r = rank - 1;
    f = file + 1;
    while r >= 1 && f <= 6 {
        attacks |= 1u64 << (r * 8 + f);
        r -= 1;
        f += 1;
    }

    // south-west
    r = rank - 1;
    f = file - 1;
    while r >= 1 && f >= 1 {
        attacks |= 1u64 << (r * 8 + f);
        r -= 1;
        f -= 1;
    }

    return attacks;
}

pub(super) const fn compute_bishop_attacks(square: usize, blockers: u64) -> u64 {
    let mut attacks = 0u64;

    let rank = (square / 8) as i32;
    let file = (square % 8) as i32;

    // north-east
    let mut r = rank + 1;
    let mut f = file + 1;
    while r <= 7 && f <= 7 {
        attacks |= 1u64 << (r * 8 + f);
        if blockers & (1u64 << (r * 8 + f)) != 0 {
            break;
        }
        r += 1;
        f += 1;
    }

    // north-west
    r = rank + 1;
    f = file - 1;
    while r <= 7 && f >= 0 {
        attacks |= 1u64 << (r * 8 + f);
        if blockers & (1u64 << (r * 8 + f)) != 0 {
            break;
        }
        r += 1;
        f -= 1;
    }

    // south-east
    r = rank - 1;
    f = file + 1;
    while r >= 0 && f <= 7 {
        attacks |= 1u64 << (r * 8 + f);
        if blockers & (1u64 << (r * 8 + f)) != 0 {
            break;
        }
        r -= 1;
        f += 1;
    }

    // south-west
    r = rank - 1;
    f = file - 1;
    while r >= 0 && f >= 0 {
        attacks |= 1u64 << (r * 8 + f);
        if blockers & (1u64 << (r * 8 + f)) != 0 {
            break;
        }
        r -= 1;
        f -= 1;
    }

    return attacks;
}

pub(super) const fn mask_rook_attacks(square: usize) -> u64 {
    let mut attacks = 0u64;

    let rank = (square / 8) as i32;
    let file = (square % 8) as i32;

    // north
    let mut r = rank + 1;
    while r <= 6 {
        attacks |= 1u64 << (r * 8 + file);
        r += 1;
    }

    // east
    let mut f = file + 1;
    while f <= 6 {
        attacks |= 1u64 << (rank * 8 + f);
        f += 1;
    }

    // south
    r = rank - 1;
    while r >= 1 {
        attacks |= 1u64 << (r * 8 + file);
        r -= 1;
    }

    // west
    f = file - 1;
    while f >= 1 {
        attacks |= 1u64 << (rank * 8 + f);
        f -= 1;
    }

    return attacks;
}

pub(super) const fn compute_rook_attacks(square: usize, blockers: u64) -> u64 {
    let mut attacks = 0u64;

    let rank = (square / 8) as i32;
    let file = (square % 8) as i32;

    // north
    let mut r = rank + 1;
    while r <= 7 {
        attacks |= 1u64 << (r * 8 + file);
        if blockers & (1u64 << (r * 8 + file)) != 0 {
            break;
        }
        r += 1;
    }

    // east
    let mut f = file + 1;
    while f <= 7 {
        attacks |= 1u64 << (rank * 8 + f);
        if blockers & (1u64 << (rank * 8 + f)) != 0 {
            break;
        }
        f += 1;
    }

    // south
    r = rank - 1;
    while r >= 0 {
        attacks |= 1u64 << (r * 8 + file);
        if blockers & (1u64 << (r * 8 + file)) != 0 {
            break;
        }
        r -= 1;
    }

    // west
    f = file - 1;
    while f >= 0 {
        attacks |= 1u64 << (rank * 8 + f);
        if blockers & (1u64 << (rank * 8 + f)) != 0 {
            break;
        }
        f -= 1;
    }

    return attacks;
}

#[cfg(test)]
mod test {
    use crate::attacks::sliders::{
        compute_bishop_attacks, compute_rook_attacks, mask_bishop_attacks, mask_rook_attacks,
    };

    #[test]
    fn bishop_masks() {
        assert_eq!(mask_bishop_attacks(28), 0x0002442800284400); // e4
        assert_eq!(mask_bishop_attacks(9), 0x0040201008040000); // b2
        assert_eq!(mask_bishop_attacks(26), 0x0020100A000A1000); // c4
        assert_eq!(mask_bishop_attacks(61), 0x0050080402000000); // f8
    }

    #[test]
    fn bishop_attacks() {
        assert_eq!(
            compute_bishop_attacks(28, 0x0000440000004400),
            0x0000442800284400
        );
        assert_eq!(
            compute_bishop_attacks(9, 0x0040000000000000),
            0x0040201008050005
        );
        assert_eq!(
            compute_bishop_attacks(26, 0x0020000200000000),
            0x0020100A000A1120
        );
        assert_eq!(
            compute_bishop_attacks(61, 0x0040000002000000),
            0x0050080402000000
        );
    }

    #[test]
    fn rook_masks() {
        assert_eq!(mask_rook_attacks(0), 0x000101010101017E); // a1
        assert_eq!(mask_rook_attacks(28), 0x001010106E101000); // e4
        assert_eq!(mask_rook_attacks(61), 0x5E20202020202000); // f8
        assert_eq!(mask_rook_attacks(10), 0x0004040404047A00); // c2
    }

    #[test]
    fn rook_attacks() {
        assert_eq!(
            compute_rook_attacks(0, 0x0000000100000010),
            0x000000010101011E
        );
        assert_eq!(
            compute_rook_attacks(28, 0x0000100020000000),
            0x000010102F101010
        );
        assert_eq!(
            compute_rook_attacks(61, 0x4000000020000000),
            0x5F20202020000000
        );
        assert_eq!(
            compute_rook_attacks(10, 0x0000000400002204),
            0x0000000404043A04
        );
    }
}
