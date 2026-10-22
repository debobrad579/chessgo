use crate::{
    compute_table,
    masks::{NOT_A, NOT_AB, NOT_GH, NOT_H},
};

pub static KNIGHT_ATTACKS: [u64; 64] = compute_table!(compute_knight_attacks);
pub static KING_ATTACKS: [u64; 64] = compute_table!(compute_king_attacks);

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
    use crate::{
        masks::leapers::{KING_ATTACKS, KNIGHT_ATTACKS},
        types::Square,
    };

    #[test]
    fn knight_attacks() {
        assert_eq!(KNIGHT_ATTACKS[Square::C3 as usize], 0x0000000A1100110A);
        assert_eq!(KNIGHT_ATTACKS[Square::F6 as usize], 0x5088008850000000);
        assert_eq!(KNIGHT_ATTACKS[Square::A1 as usize], 0x0000000000020400);
        assert_eq!(KNIGHT_ATTACKS[Square::B1 as usize], 0x0000000000050800);
        assert_eq!(KNIGHT_ATTACKS[Square::G1 as usize], 0x0000000000A01000);
        assert_eq!(KNIGHT_ATTACKS[Square::H1 as usize], 0x0000000000402000);
        assert_eq!(KNIGHT_ATTACKS[Square::G3 as usize], 0x000000A0100010A0);
        assert_eq!(KNIGHT_ATTACKS[Square::B6 as usize], 0x0508000805000000);
    }

    #[test]
    fn king_attacks() {
        assert_eq!(KING_ATTACKS[Square::E4 as usize], 0x0000003828380000);
        assert_eq!(KING_ATTACKS[Square::G1 as usize], 0x000000000000E0A0);
        assert_eq!(KING_ATTACKS[Square::H1 as usize], 0x000000000000C040);
        assert_eq!(KING_ATTACKS[Square::B8 as usize], 0x0507000000000000);
        assert_eq!(KING_ATTACKS[Square::A8 as usize], 0x0203000000000000);
        assert_eq!(KING_ATTACKS[Square::H4 as usize], 0x000000C040C00000);
        assert_eq!(KING_ATTACKS[Square::A4 as usize], 0x0000000302030000);
    }
}
