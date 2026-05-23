use crate::state::{ColorArray, PieceArray};

const MATERIAL_SCORES: ColorArray<PieceArray<i32>> = ColorArray::new([
    PieceArray::new([100, 300, 350, 500, 950, 10000]),
    PieceArray::new([-100, -300, -350, -500, -950, -10000]),
]);
