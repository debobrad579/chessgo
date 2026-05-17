const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;
const NOT_AB: u64 = 0xFCFCFCFCFCFCFCFC;
const NOT_GH: u64 = 0x3F3F3F3F3F3F3F3F;

const fn compute_pawn_attacks(is_black: bool) -> [u64; 64] {
    let mut table = [0u64; 64];

    let mut i = 0;
    while i < 64 {
        let bit = 1u64 << i;
        let mut attacks = 0u64;

        if is_black {
            attacks |= (bit & NOT_H) >> 7; // south-east
            attacks |= (bit & NOT_A) >> 9; // south-west
        } else {
            attacks |= (bit & NOT_H) << 9; // north-east
            attacks |= (bit & NOT_A) << 7; // north-west
        }

        table[i] = attacks;
        i += 1;
    }

    return table;
}

const fn compute_knight_attacks() -> [u64; 64] {
    let mut table = [0u64; 64];

    let mut i = 0;
    while i < 64 {
        let bit = 1u64 << i;
        let mut attacks = 0u64;

        attacks |= (bit & NOT_H) << 17; // north-north-east
        attacks |= (bit & NOT_A) << 15; // north-north-west
        attacks |= (bit & NOT_GH) << 10; // north-east-east
        attacks |= (bit & NOT_AB) << 6; // north-west-west

        attacks |= (bit & NOT_A) >> 17; // south-south-west
        attacks |= (bit & NOT_H) >> 15; // south-south-east
        attacks |= (bit & NOT_AB) >> 10; // south-west-west
        attacks |= (bit & NOT_GH) >> 6; // south-east-east

        table[i] = attacks;
        i += 1;
    }

    return table;
}

const fn compute_king_attacks() -> [u64; 64] {
    let mut table = [0u64; 64];

    let mut i = 0;
    while i < 64 {
        let bit = 1u64 << i;
        let mut attacks = 0u64;

        attacks |= bit << 8; // north
        attacks |= (bit & NOT_A) << 7; // north-west
        attacks |= (bit & NOT_H) << 9; // north-east

        attacks |= bit >> 8; // south
        attacks |= (bit & NOT_A) >> 9; // south-west
        attacks |= (bit & NOT_H) >> 7; // south-east

        attacks |= (bit & NOT_H) << 1; // east
        attacks |= (bit & NOT_A) >> 1; // west

        table[i] = attacks;
        i += 1;
    }

    return table;
}

const fn compute_bishop_attack_masks() -> [u64; 64] {
    let mut table = [0u64; 64];

    let mut i = 0;
    while i < 64 {
        let mut attacks = 0u64;

        let rank = (i / 8) as i32;
        let file = (i % 8) as i32;

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

        table[i] = attacks;
        i += 1;
    }

    return table;
}

pub static WHITE_PAWN_ATTACKS: [u64; 64] = compute_pawn_attacks(false);
pub static BLACK_PAWN_ATTACKS: [u64; 64] = compute_pawn_attacks(true);
pub static KNIGHT_ATTACKS: [u64; 64] = compute_knight_attacks();
pub static KING_ATTACKS: [u64; 64] = compute_king_attacks();
pub static BISHOP_ATTACK_MASKS: [u64; 64] = compute_bishop_attack_masks();

#[cfg(test)]
mod test {
    use crate::attacks::{
        BISHOP_ATTACK_MASKS, BLACK_PAWN_ATTACKS, KING_ATTACKS, KNIGHT_ATTACKS, WHITE_PAWN_ATTACKS,
    };

    #[test]
    fn white_pawn() {
        assert_eq!(WHITE_PAWN_ATTACKS[28], 0x0000002800000000); // e4
        assert_eq!(WHITE_PAWN_ATTACKS[31], 0x0000004000000000); // h4
        assert_eq!(WHITE_PAWN_ATTACKS[24], 0x0000000200000000); // a4
    }

    #[test]
    fn black_pawn() {
        assert_eq!(BLACK_PAWN_ATTACKS[36], 0x0000000028000000); // e5
        assert_eq!(BLACK_PAWN_ATTACKS[39], 0x0000000040000000); // h5
        assert_eq!(BLACK_PAWN_ATTACKS[32], 0x0000000002000000); // a5
    }

    #[test]
    fn knight() {
        assert_eq!(KNIGHT_ATTACKS[18], 0x0000000A1100110A); // c3
        assert_eq!(KNIGHT_ATTACKS[45], 0x5088008850000000); // f6
        assert_eq!(KNIGHT_ATTACKS[0], 0x0000000000020400); // a1
        assert_eq!(KNIGHT_ATTACKS[1], 0x0000000000050800); // b1
        assert_eq!(KNIGHT_ATTACKS[7], 0x0000000000402000); // h1
        assert_eq!(KNIGHT_ATTACKS[6], 0x0000000000A01000); // g1
        assert_eq!(KNIGHT_ATTACKS[22], 0x000000A0100010A0); // g3
        assert_eq!(KNIGHT_ATTACKS[41], 0x0508000805000000); // b6
    }

    #[test]
    fn king() {
        assert_eq!(KING_ATTACKS[28], 0x0000003828380000); // e4
        assert_eq!(KING_ATTACKS[6], 0x000000000000E0A0); // g1
        assert_eq!(KING_ATTACKS[7], 0x000000000000C040); // h1
        assert_eq!(KING_ATTACKS[57], 0x0507000000000000); // b8
        assert_eq!(KING_ATTACKS[56], 0x0203000000000000); // a8
        assert_eq!(KING_ATTACKS[31], 0x000000C040C00000); // h4
        assert_eq!(KING_ATTACKS[24], 0x0000000302030000); // a4
    }

    #[test]
    fn bishop_mask() {
        assert_eq!(BISHOP_ATTACK_MASKS[28], 0x0002442800284400); // e4
        assert_eq!(BISHOP_ATTACK_MASKS[9], 0x0040201008040000); // b2
        assert_eq!(BISHOP_ATTACK_MASKS[26], 0x0020100a000a1000); // c4
        assert_eq!(BISHOP_ATTACK_MASKS[61], 0x0050080402000000); // f8
    }
}
