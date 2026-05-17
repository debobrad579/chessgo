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

        attacks |= (bit & NOT_H) << 17;
        attacks |= (bit & NOT_A) << 15;
        attacks |= (bit & NOT_GH) << 10;
        attacks |= (bit & NOT_AB) << 6;

        attacks |= (bit & NOT_A) >> 17;
        attacks |= (bit & NOT_H) >> 15;
        attacks |= (bit & NOT_AB) >> 10;
        attacks |= (bit & NOT_GH) >> 6;

        table[i] = attacks;
        i += 1;
    }

    return table;
}

pub static KNIGHT_ATTACKS: [u64; 64] = compute_knight_attacks();
