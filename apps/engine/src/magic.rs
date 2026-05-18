use crate::attacks::{
    compute_bishop_attacks, compute_rook_attacks, mask_bishop_attacks, mask_rook_attacks,
};

const RANDOM_SEED: u32 = 1804289383;

const fn xorshift_u32(state: &mut u32) -> u32 {
    *state ^= *state << 13;
    *state ^= *state >> 17;
    *state ^= *state << 5;
    return *state;
}

const fn generate_pseudorandom_u64(state: &mut u32) -> u64 {
    let n1 = (xorshift_u32(state) as u64) & 0xFFFF;
    let n2 = (xorshift_u32(state) as u64) & 0xFFFF;
    let n3 = (xorshift_u32(state) as u64) & 0xFFFF;
    let n4 = (xorshift_u32(state) as u64) & 0xFFFF;
    return n1 | (n2 << 16) | (n3 << 32) | (n4 << 48);
}

const fn generate_magic_number_candidate(state: &mut u32) -> u64 {
    generate_pseudorandom_u64(state)
        & generate_pseudorandom_u64(state)
        & generate_pseudorandom_u64(state)
}

const fn find_magic_number(square: usize, is_bishop: bool) -> u64 {
    let mut occupancies = [0u64; 4096];
    let mut attacks = [0u64; 4096];
    let attack_mask = if is_bishop {
        mask_bishop_attacks(square)
    } else {
        mask_rook_attacks(square)
    };

    let mut i = 0;
    let mut subset = attack_mask;
    loop {
        occupancies[i] = subset;
        attacks[i] = if is_bishop {
            compute_bishop_attacks(square, occupancies[i])
        } else {
            compute_rook_attacks(square, occupancies[i])
        };

        i += 1;

        if subset == 0 {
            break;
        }

        subset = (subset - 1) & attack_mask;
    }

    let occupancy_count = i;

    let relevant_bits = attack_mask.count_ones();
    let mut random_state = RANDOM_SEED;
    'magic_loop: loop {
        let magic_number = generate_magic_number_candidate(&mut random_state);
        if (attack_mask.wrapping_mul(magic_number) & 0xFF00000000000000).count_ones() < 6 {
            continue;
        }

        let mut used_attacks = [0u64; 4096];
        let mut i = 0;
        while i < occupancy_count {
            let magic_index =
                ((occupancies[i].wrapping_mul(magic_number)) >> (64 - relevant_bits)) as usize;

            if used_attacks[magic_index] == 0 {
                used_attacks[magic_index] = attacks[i];
            } else if used_attacks[magic_index] != attacks[i] {
                continue 'magic_loop;
            }

            i += 1;
        }

        return magic_number;
    }
}
