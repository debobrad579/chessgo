#[macro_export]
macro_rules! compute_table {
    ($f:expr) => {{
        let mut table = [($f)(0); 64];

        let mut i = 1;
        while i < 64 {
            table[i] = ($f)(i);
            i += 1;
        }

        table
    }};
}

#[macro_export]
macro_rules! get_bishop_attacks {
    ($square:expr, $occupancy:expr) => {{
        let attack_mask = $crate::attacks::BISHOP_MASKS[$square];
        let relevant_occupancy = $occupancy & attack_mask;

        let index = (relevant_occupancy
            .wrapping_mul($crate::magics::BISHOP_MAGIC_NUMBERS[$square]))
            >> (64 - attack_mask.count_ones());

        $crate::magics::MAGIC_BISHOP_ATTACKS[$square][index as usize]
    }};
}

#[macro_export]
macro_rules! get_rook_attacks {
    ($square:expr, $occupancy:expr) => {{
        let attack_mask = $crate::attacks::ROOK_MASKS[$square];
        let relevant_occupancy = $occupancy & attack_mask;

        let index = (relevant_occupancy.wrapping_mul($crate::magics::ROOK_MAGIC_NUMBERS[$square]))
            >> (64 - attack_mask.count_ones());

        $crate::magics::MAGIC_ROOK_ATTACKS[$square][index as usize]
    }};
}

#[macro_export]
macro_rules! get_queen_attacks {
    ($square:expr, $occupancy:expr) => {{ get_bishop_attacks!($square, $occupancy) | get_rook_attacks!($square, $occupancy) }};
}
