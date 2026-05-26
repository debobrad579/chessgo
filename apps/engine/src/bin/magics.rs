use oxchess::{
    compute_table,
    movegen::magics::{find_bishop_magic_number, find_rook_magic_number},
};

fn main() {
    println!(
        "pub static BISHOP_MAGIC_NUMBERS: [u64; 64] = {:#018X?};\n",
        compute_table!(find_bishop_magic_number)
    );
    println!(
        "pub static ROOK_MAGIC_NUMBERS: [u64; 64] = {:#018X?};",
        compute_table!(find_rook_magic_number)
    );
}
