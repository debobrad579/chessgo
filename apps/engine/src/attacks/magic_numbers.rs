use crate::{
    attacks::{
        BISHOP_MASKS, ROOK_MASKS,
        sliders::{compute_bishop_attacks, compute_rook_attacks},
    },
    random::{RANDOM_SEED, generate_pseudorandom_u64},
};

const fn generate_magic_number_candidate(state: &mut u32) -> u64 {
    generate_pseudorandom_u64(state)
        & generate_pseudorandom_u64(state)
        & generate_pseudorandom_u64(state)
}

pub const fn find_bishop_magic_number(square: usize) -> u64 {
    let mut occupancies = [0u64; 512];
    let mut attacks = [0u64; 512];
    let attack_mask = BISHOP_MASKS[square];

    let mut i = 0;
    let mut subset = attack_mask;
    loop {
        occupancies[i] = subset;
        attacks[i] = compute_bishop_attacks(square, occupancies[i]);

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

        let mut used_attacks = [0u64; 512];
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

pub const fn find_rook_magic_number(square: usize) -> u64 {
    let mut occupancies = [0u64; 4096];
    let mut attacks = [0u64; 4096];
    let attack_mask = ROOK_MASKS[square];

    let mut i = 0;
    let mut subset = attack_mask;
    loop {
        occupancies[i] = subset;
        attacks[i] = compute_rook_attacks(square, occupancies[i]);

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

#[rustfmt::skip]
pub(super) static BISHOP_MAGIC_NUMBERS: [u64; 64] = [
    0x0040014801010024, 0x2882220801010110, 0x0021010400840002, 0x0148048702000801, 0x1001114000000408, 0x108110080404A500, 0x0000840402C02000, 0x0941010082200222,
    0x8000401102020048, 0x4000200800808490, 0x0001880800488118, 0x108024040286420C, 0x0800020211000000, 0x0940008820080080, 0x0808320101384081, 0x8600044262101048,
    0x0040105618820404, 0x802000101A009300, 0x8008203004802008, 0x9004008840408800, 0x4A84000210140010, 0x02010012008C8C80, 0x0042020120822008, 0x02010012008C8C80,
    0x3209088040028802, 0x040804C402042802, 0x0802010002280200, 0x0804080100220040, 0xE20101000410400B, 0x0208028001100080, 0x004884021C820800, 0x000400828100A086,
    0x0404200808041005, 0x0148041108040101, 0xE40C104400282801, 0x1022200800028820, 0x10080A0400401010, 0x0510008200102202, 0xA1A20C0510004800, 0x000A028100802421,
    0x2048240424002212, 0x0054110109091000, 0x00000C0048000400, 0x4920002128000400, 0x08E0A02009001084, 0x1004208889000A00, 0x20200800C1008086, 0x4601121082040111,
    0x0000840402C02000, 0x0002004404844040, 0x0400042422081000, 0x0040008084040000, 0x2000081082020402, 0x0240042094090200, 0x0004705042029024, 0x2882220801010110,
    0x0941010082200222, 0x8600044262101048, 0x0008201C42009002, 0x0000920301049801, 0x5080000004050404, 0x0001A24050044129, 0x8000401102020048, 0x0040014801010024,
];

#[rustfmt::skip]
pub(super) static ROOK_MAGIC_NUMBERS: [u64; 64] = [
    0x0480002088104000, 0x5080200010400080, 0x0200100A00804020, 0x848008000480F000, 0x4380080002810400, 0x0100080400010002, 0x9080608001000200, 0x0180008000402500,
    0x1004800240008220, 0x2110C00020100140, 0x0065001020010140, 0xC027808008001000, 0x0400800400080080, 0x0000800200040080, 0x0000800100020080, 0x2002000040810402,
    0x0010208000400E80, 0x0000414010002004, 0x0200110020004900, 0x0022020020100840, 0x0204808008000400, 0x0101010002040008, 0x1208040041280210, 0x0184020012930844,
    0x400B40008003A190, 0xA0605000C0002001, 0x2000200080801000, 0x0210100080080480, 0x4040080100050010, 0x2603005900021400, 0x0040080400010210, 0x00C0088200004134,
    0x088000A001400142, 0x0810002008404000, 0x2000200080801000, 0x0008840800801000, 0x0440080085001100, 0x0402001004040020, 0x0802000882005114, 0x5204004082000104,
    0x4010401080208004, 0x0820500020004000, 0x04A8420080120020, 0x110110030021000B, 0x1104008040080800, 0x8000020004008080, 0x0089040200010100, 0x200C084884020029,
    0x4A00800100384100, 0x4000401084290100, 0x0048804208201200, 0x0008001000820880, 0x0400800400080080, 0x0002018410080200, 0x0302002804014200, 0x0000800100076080,
    0x084C402011020082, 0x084C402011020082, 0x80200308C0102101, 0x0052000804201042, 0x0402000810042002, 0x0003000C00320809, 0x0000420810010084, 0x58200400A7488102,
];
