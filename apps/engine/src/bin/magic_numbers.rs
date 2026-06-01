use oxchess::attacks::magic_numbers::{find_bishop_magic_number, find_rook_magic_number};

fn main() {
    println!("#[rustfmt::skip]");
    println!("pub static BISHOP_MAGIC_NUMBERS: [u64; 64] = [",);
    for i in 0..8 {
        print!("    ");
        for j in 0..8 {
            print!("0x{:016X},", find_bishop_magic_number(i * 8 + j));
            if j != 7 {
                print!(" ");
            }
        }
        println!();
    }
    println!("];\n");

    println!("#[rustfmt::skip]");
    println!("pub static ROOK_MAGIC_NUMBERS: [u64; 64] = [",);
    for i in 0..8 {
        print!("    ");
        for j in 0..8 {
            print!("0x{:016X},", find_rook_magic_number(i * 8 + j));
            if j != 7 {
                print!(" ");
            }
        }
        println!();
    }
    println!("];");
}
