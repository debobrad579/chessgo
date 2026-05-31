use crate::types::PieceArray;

pub(in crate::position::eval) const MATERIAL_SCORES: PieceArray<i32> =
    PieceArray::new([100, 320, 350, 500, 950, 20000]);

#[rustfmt::skip]
const PAWN_POSITIONAL_SCORES: [i32; 64] = [
     0,   0,   0,   0,   0,   0,   0,   0,  // rank 1
     5,  10,  10, -20, -20,  10,  10,   5,  // rank 2
     5,  -5, -10,   0,   0, -10,  -5,   5,  // rank 3
     0,   0,   0,  20,  20,   0,   0,   0,  // rank 4
     5,   5,  10,  25,  25,  10,   5,   5,  // rank 5
    10,  10,  20,  30,  30,  20,  10,  10,  // rank 6
    50,  50,  50,  50,  50,  50,  50,  50,  // rank 7
     0,   0,   0,   0,   0,   0,   0,   0,  // rank 8
];

#[rustfmt::skip]
const KNIGHT_POSITIONAL_SCORES: [i32; 64] = [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20,   0,   5,   5,   0, -20, -40,
    -30,   5,  10,  15,  15,  10,   5, -30,
    -30,   0,  15,  20,  20,  15,   0, -30,
    -30,   5,  15,  20,  20,  15,   5, -30,
    -30,   0,  10,  15,  15,  10,   0, -30,
    -40, -20,   0,   0,   0,   0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
];

#[rustfmt::skip]
const BISHOP_POSITIONAL_SCORES: [i32; 64] = [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10,   5,   0,   0,   0,   0,   5, -10,
    -10,  10,  10,  10,  10,  10,  10, -10,
    -10,   0,  10,  10,  10,  10,   0, -10,
    -10,   5,   5,  10,  10,   5,   5, -10,
    -10,   0,   5,  10,  10,   5,   0, -10,
    -10,   0,   0,   0,   0,   0,   0, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
];

#[rustfmt::skip]
const ROOK_POSITIONAL_SCORES: [i32; 64] = [
     0,   0,   0,   5,   5,   0,   0,   0,
    -5,   0,   0,   0,   0,   0,   0,  -5,
    -5,   0,   0,   0,   0,   0,   0,  -5,
    -5,   0,   0,   0,   0,   0,   0,  -5,
    -5,   0,   0,   0,   0,   0,   0,  -5,
    -5,   0,   0,   0,   0,   0,   0,  -5,
     5,  10,  10,  10,  10,  10,  10,   5,
     0,   0,   0,   0,   0,   0,   0,   0,
];

#[rustfmt::skip]
const QUEEN_POSITIONAL_SCORES: [i32; 64] = [
    -20, -10, -10,  -5,  -5, -10, -10, -20,
    -10,   0,   5,   0,   0,   0,   0, -10,
    -10,   5,   5,   5,   5,   5,   0, -10,
      0,   0,   5,   5,   5,   5,   0,  -5,
     -5,   0,   5,   5,   5,   5,   0,  -5,
    -10,   0,   5,   5,   5,   5,   0, -10,
    -10,   0,   0,   0,   0,   0,   0, -10,
    -20, -10, -10,  -5,  -5, -10, -10, -20,
];

#[rustfmt::skip]
const KING_MIDDLEGAME_POSITIONAL_SCORES: [i32; 64] = [
     20,  30,  10,   0,   0,  10,  30,  20,
     20,  20,   0,   0,   0,   0,  20,  20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
];

#[rustfmt::skip]
const KING_ENDGAME_POSITIONAL_SCORES: [i32; 64] = [
    -50, -30, -30, -30, -30, -30, -30, -50,
    -30, -30,   0,   0,   0,   0, -30, -30,
    -30, -10,  20,  30,  30,  20, -10, -30,
    -30, -10,  30,  40,  40,  30, -10, -30,
    -30, -10,  30,  40,  40,  30, -10, -30,
    -30, -10,  20,  30,  30,  20, -10, -30,
    -30, -20, -10,   0,   0, -10, -20, -30,
    -50, -40, -30, -20, -20, -30, -40, -50,
];

pub(in crate::position::eval) const MIDDLEGAME_POSITIONAL_SCORES: PieceArray<[i32; 64]> =
    PieceArray::new([
        PAWN_POSITIONAL_SCORES,
        KNIGHT_POSITIONAL_SCORES,
        BISHOP_POSITIONAL_SCORES,
        ROOK_POSITIONAL_SCORES,
        QUEEN_POSITIONAL_SCORES,
        KING_MIDDLEGAME_POSITIONAL_SCORES,
    ]);

pub(in crate::position::eval) const ENDGAME_POSITIONAL_SCORES: PieceArray<[i32; 64]> =
    PieceArray::new([
        PAWN_POSITIONAL_SCORES,
        KNIGHT_POSITIONAL_SCORES,
        BISHOP_POSITIONAL_SCORES,
        ROOK_POSITIONAL_SCORES,
        QUEEN_POSITIONAL_SCORES,
        KING_ENDGAME_POSITIONAL_SCORES,
    ]);
