use crate::random::{RANDOM_SEED, generate_pseudorandom_u64};

type PieceKeys = [[[u64; 6]; 2]; 64];

const KEYS: (PieceKeys, [u64; 64], [u64; 16], u64) = generate_pseudorandom_keys();

pub(super) static PIECE_KEYS: PieceKeys = KEYS.0;
pub(super) static ENPASSANT_KEYS: [u64; 64] = KEYS.1;
pub(super) static CASTLE_KEYS: [u64; 16] = KEYS.2;
pub(super) static TURN_KEY: u64 = KEYS.3;

const fn generate_pseudorandom_keys() -> (PieceKeys, [u64; 64], [u64; 16], u64) {
    let mut random_state = RANDOM_SEED;

    let mut piece_keys = [[[0u64; 6]; 2]; 64];
    let mut enpassant_keys = [0u64; 64];
    let mut castle_keys = [0u64; 16];
    let turn_key = generate_pseudorandom_u64(&mut random_state);

    let mut square = 0;
    while square < 64 {
        let mut color = 0;
        while color < 2 {
            let mut piece = 0;
            while piece < 6 {
                piece_keys[square][color][piece] = generate_pseudorandom_u64(&mut random_state);
                piece += 1;
            }
            color += 1;
        }

        enpassant_keys[square] = generate_pseudorandom_u64(&mut random_state);

        square += 1;
    }

    let mut castle = 0;
    while castle < castle_keys.len() {
        castle_keys[castle] = generate_pseudorandom_u64(&mut random_state);
        castle += 1;
    }

    (piece_keys, enpassant_keys, castle_keys, turn_key)
}
