pub const RANDOM_SEED: u32 = 0x12345678;

const fn xorshift_u32(state: &mut u32) -> u32 {
    *state ^= *state << 13;
    *state ^= *state >> 17;
    *state ^= *state << 5;
    return *state;
}

pub const fn generate_pseudorandom_u64(state: &mut u32) -> u64 {
    let n1 = (xorshift_u32(state) as u64) & 0xFFFF;
    let n2 = (xorshift_u32(state) as u64) & 0xFFFF;
    let n3 = (xorshift_u32(state) as u64) & 0xFFFF;
    let n4 = (xorshift_u32(state) as u64) & 0xFFFF;
    return n1 | (n2 << 16) | (n3 << 32) | (n4 << 48);
}
