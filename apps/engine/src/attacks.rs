use crate::compute_table;

const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;
const NOT_AB: u64 = 0xFCFCFCFCFCFCFCFC;
const NOT_GH: u64 = 0x3F3F3F3F3F3F3F3F;

const fn compute_white_pawn_attacks(square: usize) -> u64 {
    let bit = 1u64 << square;
    let mut attacks = 0u64;

    attacks |= (bit & NOT_H) << 9; // north-east
    attacks |= (bit & NOT_A) << 7; // north-west

    return attacks;
}

const fn compute_black_pawn_attacks(square: usize) -> u64 {
    let bit = 1u64 << square;
    let mut attacks = 0u64;

    attacks |= (bit & NOT_H) >> 7; // south-east
    attacks |= (bit & NOT_A) >> 9; // south-west

    return attacks;
}

const fn compute_knight_attacks(square: usize) -> u64 {
    let bit = 1u64 << square;
    let mut attacks = 0u64;

    attacks |= (bit & NOT_H) << 17; // north-north-east
    attacks |= (bit & NOT_A) << 15; // north-north-west
    attacks |= (bit & NOT_GH) << 10; // north-east-east
    attacks |= (bit & NOT_AB) << 6; // north-west-west

    attacks |= (bit & NOT_A) >> 17; // south-south-west
    attacks |= (bit & NOT_H) >> 15; // south-south-east
    attacks |= (bit & NOT_AB) >> 10; // south-west-west
    attacks |= (bit & NOT_GH) >> 6; // south-east-east
    //
    return attacks;
}

const fn compute_king_attacks(square: usize) -> u64 {
    let bit = 1u64 << square;
    let mut attacks = 0u64;

    attacks |= bit << 8; // north
    attacks |= (bit & NOT_A) << 7; // north-west
    attacks |= (bit & NOT_H) << 9; // north-east

    attacks |= bit >> 8; // south
    attacks |= (bit & NOT_A) >> 9; // south-west
    attacks |= (bit & NOT_H) >> 7; // south-east

    attacks |= (bit & NOT_H) << 1; // east
    attacks |= (bit & NOT_A) >> 1; // west

    return attacks;
}

const fn mask_bishop_attacks(square: usize) -> u64 {
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

pub const fn compute_bishop_attacks(square: usize, blockers: u64) -> u64 {
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

const fn mask_rook_attacks(square: usize) -> u64 {
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

pub const fn compute_rook_attacks(square: usize, blockers: u64) -> u64 {
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

pub static WHITE_PAWN_ATTACKS: [u64; 64] = compute_table!(compute_white_pawn_attacks);
pub static BLACK_PAWN_ATTACKS: [u64; 64] = compute_table!(compute_black_pawn_attacks);
pub static KNIGHT_ATTACKS: [u64; 64] = compute_table!(compute_knight_attacks);
pub static KING_ATTACKS: [u64; 64] = compute_table!(compute_king_attacks);
pub static BISHOP_MASKS: [u64; 64] = compute_table!(mask_bishop_attacks);
pub static ROOK_MASKS: [u64; 64] = compute_table!(mask_rook_attacks);

#[cfg(test)]
mod test {
    use crate::attacks::{
        compute_bishop_attacks, compute_black_pawn_attacks, compute_king_attacks,
        compute_knight_attacks, compute_rook_attacks, compute_white_pawn_attacks,
        mask_bishop_attacks, mask_rook_attacks,
    };

    #[test]
    fn white_pawn_attacks() {
        assert_eq!(compute_white_pawn_attacks(28), 0x0000002800000000); // e4
        assert_eq!(compute_white_pawn_attacks(31), 0x0000004000000000); // h4
        assert_eq!(compute_white_pawn_attacks(24), 0x0000000200000000); // a4
    }

    #[test]
    fn black_pawn_attacks() {
        assert_eq!(compute_black_pawn_attacks(36), 0x0000000028000000); // e5
        assert_eq!(compute_black_pawn_attacks(39), 0x0000000040000000); // h5
        assert_eq!(compute_black_pawn_attacks(32), 0x0000000002000000); // a5
    }

    #[test]
    fn knight_attacks() {
        assert_eq!(compute_knight_attacks(18), 0x0000000A1100110A); // c3
        assert_eq!(compute_knight_attacks(45), 0x5088008850000000); // f6
        assert_eq!(compute_knight_attacks(0), 0x0000000000020400); // a1
        assert_eq!(compute_knight_attacks(1), 0x0000000000050800); // b1
        assert_eq!(compute_knight_attacks(6), 0x0000000000A01000); // g1
        assert_eq!(compute_knight_attacks(7), 0x0000000000402000); // h1
        assert_eq!(compute_knight_attacks(22), 0x000000A0100010A0); // g3
        assert_eq!(compute_knight_attacks(41), 0x0508000805000000); // b6
    }

    #[test]
    fn king_attacks() {
        assert_eq!(compute_king_attacks(28), 0x0000003828380000); // e4
        assert_eq!(compute_king_attacks(6), 0x000000000000E0A0); // g1
        assert_eq!(compute_king_attacks(7), 0x000000000000C040); // h1
        assert_eq!(compute_king_attacks(57), 0x0507000000000000); // b8
        assert_eq!(compute_king_attacks(56), 0x0203000000000000); // a8
        assert_eq!(compute_king_attacks(31), 0x000000C040C00000); // h4
        assert_eq!(compute_king_attacks(24), 0x0000000302030000); // a4
    }

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
