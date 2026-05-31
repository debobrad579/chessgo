const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;
const NOT_AB: u64 = 0xFCFCFCFCFCFCFCFC;
const NOT_GH: u64 = 0x3F3F3F3F3F3F3F3F;

pub(super) const fn compute_white_pawn_attacks(square: usize) -> u64 {
    let bit = 1u64 << square;
    let mut attacks = 0u64;

    attacks |= (bit & NOT_H) << 9; // north-east
    attacks |= (bit & NOT_A) << 7; // north-west

    return attacks;
}

pub(super) const fn compute_black_pawn_attacks(square: usize) -> u64 {
    let bit = 1u64 << square;
    let mut attacks = 0u64;

    attacks |= (bit & NOT_H) >> 7; // south-east
    attacks |= (bit & NOT_A) >> 9; // south-west

    return attacks;
}

pub(super) const fn compute_knight_attacks(square: usize) -> u64 {
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

    return attacks;
}

pub(super) const fn compute_king_attacks(square: usize) -> u64 {
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

#[cfg(test)]
mod test {
    use crate::attacks::leapers::{
        compute_black_pawn_attacks, compute_king_attacks, compute_knight_attacks,
        compute_white_pawn_attacks,
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
}
