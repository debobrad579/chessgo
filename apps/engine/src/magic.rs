use crate::{
    attacks::{BISHOP_MASKS, ROOK_MASKS, compute_bishop_attacks, compute_rook_attacks},
    compute_table,
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
        BISHOP_MASKS[square]
    } else {
        ROOK_MASKS[square]
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

pub const fn compute_magic_numbers(is_bishop: bool) -> [u64; 64] {
    let mut table = [0u64; 64];

    let mut i = 0;
    while i < 64 {
        table[i] = find_magic_number(i, is_bishop);
        i += 1;
    }

    return table;
}

const fn compute_bishop_magic_bitboards(square: usize) -> [u64; 4096] {
    let mut attacks = [0u64; 4096];
    let attack_mask = BISHOP_MASKS[square];
    let relevant_bits = attack_mask.count_ones();
    let magic_number = BISHOP_MAGIC_NUMBERS[square];

    let mut subset = attack_mask;
    loop {
        let magic_index = (subset.wrapping_mul(magic_number)) >> (64 - relevant_bits);
        attacks[magic_index as usize] = compute_bishop_attacks(square, subset);

        if subset == 0 {
            break;
        }

        subset = (subset - 1) & attack_mask;
    }

    return attacks;
}

const fn compute_rook_magic_bitboards(square: usize) -> [u64; 4096] {
    let mut attacks = [0u64; 4096];
    let attack_mask = ROOK_MASKS[square];
    let relevant_bits = attack_mask.count_ones();
    let magic_number = ROOK_MAGIC_NUMBERS[square];

    let mut subset = attack_mask;
    loop {
        let magic_index = (subset.wrapping_mul(magic_number)) >> (64 - relevant_bits);
        attacks[magic_index as usize] = compute_rook_attacks(square, subset);

        if subset == 0 {
            break;
        }

        subset = (subset - 1) & attack_mask;
    }

    return attacks;
}

pub static MAGIC_BISHOP_ATTACKS: [[u64; 4096]; 64] = compute_table!(compute_bishop_magic_bitboards);
pub static MAGIC_ROOK_ATTACKS: [[u64; 4096]; 64] = compute_table!(compute_rook_magic_bitboards);

pub static BISHOP_MAGIC_NUMBERS: [u64; 64] = [
    0x40040822862081,
    0x10201A0200411402,
    0x81024288020C000,
    0x1404640080008810,
    0x9004242000012008,
    0x10A412020A04008,
    0x1000989008208000,
    0x22010108410402,
    0x2104840810014200,
    0x2150210810A080,
    0x81080089061040,
    0x2400A82040408008,
    0x240420005810,
    0x4200022860180000,
    0x4000090082504000,
    0x410402422220,
    0x8140420C80200,
    0x2038A4832080200,
    0xC108005006404048,
    0x2208001041404049,
    0xC014021880A01000,
    0x704200110101006,
    0x2808C12013100,
    0x6400411200444402,
    0x124240A1041400,
    0x8802088010100088,
    0x4020040408508,
    0x604080004006128,
    0x8000848004002004,
    0x4008020008405210,
    0x806000AA22902,
    0x2200888682020080,
    0x10C2105000400320,
    0x8018010800102208,
    0x4000841102100044,
    0x200800050104,
    0x160C030400280408,
    0x820080320094405,
    0x201E40100540101,
    0x8408248080002227,
    0x8021004001040,
    0x400455030034803,
    0x912020322180400,
    0x8026013002800,
    0xE000040810130200,
    0x2168500092000020,
    0x2002304119002200,
    0x1901020400400510,
    0x1000989008208000,
    0x100840108020006,
    0x3010020842088080,
    0x8000001B84044881,
    0x8004404010510072,
    0xC10801010000,
    0x4090808148101,
    0x10201A0200411402,
    0x22010108410402,
    0x410402422220,
    0x41000114204D004,
    0x4082000100840440,
    0x400C802211420200,
    0x81800140828C8100,
    0x2104840810014200,
    0x40040822862081,
];

pub static ROOK_MAGIC_NUMBERS: [u64; 64] = [
    0x8A80104000800020,
    0xC40100040082000,
    0x100102001000840,
    0x1080041000080080,
    0x4280240080020800,
    0x4800A00211C0080,
    0x1080008001000200,
    0x42000082C9020424,
    0x2002081004200,
    0x2002081004200,
    0x801000802000,
    0x201001000082100,
    0xE41001005000800,
    0x1022001008854200,
    0x211000100020084,
    0x18801041000080,
    0x80084000200040,
    0x20A0024000500020,
    0x80410010200901,
    0x2083090010002300,
    0x808004000800,
    0x804008080040200,
    0x8800040002100108,
    0x20001208044,
    0x4020800080204000,
    0x40008280200042,
    0x820200204010,
    0x200100480080080,
    0x300040080080080,
    0x804008080040200,
    0x8000020400881001,
    0x88808200204401,
    0x6480042006400041,
    0x4080804000802000,
    0x801000802000,
    0x1518001000800882,
    0xE41001005000800,
    0x1012001002000408,
    0x140108804006201,
    0x2050882000054,
    0x90080C000618011,
    0xA0004000208080,
    0x22001080220043,
    0x1012010050008,
    0x40008008080,
    0x1100040002008080,
    0x40100182040008,
    0x800000648102000C,
    0x481248002C90100,
    0x2002081004200,
    0x400C802211420200,
    0x280200C10010100,
    0x300040080080080,
    0x1100040002008080,
    0x4000018802100400,
    0x4310800100004080,
    0x4024800508102041,
    0x88801100204001,
    0x401080104200200A,
    0x8010210408100101,
    0x9202002005881002,
    0x8012004824011022,
    0x2000011002080084,
    0x1010549228402,
];

#[cfg(test)]
mod test {
    use crate::{get_bishop_attacks, get_rook_attacks};

    #[test]
    fn bishop_attacks() {
        assert_eq!(
            get_bishop_attacks!(28, 0x0000440000004400),
            0x0000442800284400
        );
        assert_eq!(
            get_bishop_attacks!(9, 0x0040000000000000),
            0x0040201008050005
        );
        assert_eq!(
            get_bishop_attacks!(26, 0x0020000200000000),
            0x0020100A000A1120
        );
        assert_eq!(
            get_bishop_attacks!(61, 0x0040000002000000),
            0x0050080402000000
        );
    }

    #[test]
    fn rook_attacks() {
        assert_eq!(get_rook_attacks!(0, 0x0000000100000010), 0x000000010101011E);
        assert_eq!(
            get_rook_attacks!(28, 0x0000100020000000),
            0x000010102F101010
        );
        assert_eq!(
            get_rook_attacks!(61, 0x4000000020000000),
            0x5F20202020000000
        );
        assert_eq!(
            get_rook_attacks!(10, 0x0000000400002204),
            0x0000000404043A04
        );
    }
}
