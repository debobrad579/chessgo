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
macro_rules! set_bit {
    ($bitboard:expr, $square:expr) => {
        $bitboard |= (1 << ($square))
    };
}

#[macro_export]
macro_rules! pop_bit {
    ($bitboard:expr, $square:expr) => {
        $bitboard &= !(1 << $square)
    };
}

#[macro_export]
macro_rules! get_bit {
    ($bitboard:expr, $square:expr) => {
        ($bitboard) & (1 << ($square))
    };
}

#[macro_export]
macro_rules! get_ls1b_index {
    ($bitboard:expr) => {
        $bitboard.trailing_zeros()
    };
}
