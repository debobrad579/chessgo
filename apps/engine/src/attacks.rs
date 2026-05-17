const NOT_A: u64 = 0xfefefefefefefefe;
const NOT_H: u64 = 0x7f7f7f7f7f7f7f7f;
const NOT_AB: u64 = 0xFCFCFCFCFCFCFCFC;
const NOT_GH: u64 = 0x3F3F3F3F3F3F3F3F;

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
        attacks |= (bit & NOT_A) << 1; // east
        attacks |= (bit & NOT_H) << 7; // north-west
        attacks |= (bit & NOT_A) << 9; // north-east

        attacks |= bit >> 8; // south
        attacks |= (bit & NOT_H) >> 1; // west
        attacks |= (bit & NOT_A) >> 7; // south-east
        attacks |= (bit & NOT_H) >> 9; // south-west

        table[i] = attacks;
        i += 1;
    }

    return table;
}

pub static KNIGHT_ATTACKS: [u64; 64] = compute_knight_attacks();
pub static KING_ATTACKS: [u64; 64] = compute_king_attacks();
