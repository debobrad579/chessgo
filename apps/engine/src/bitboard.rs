pub trait BitboardOperations {
    fn contains(&self, square: u32) -> bool;
    fn set(&mut self, square: u32);
    fn pop(&mut self, square: u32);
    fn foreach(self, f: impl FnMut(u32));
}

impl BitboardOperations for u64 {
    #[inline]
    fn contains(&self, square: u32) -> bool {
        self & (1 << square) != 0
    }

    #[inline]
    fn set(&mut self, square: u32) {
        *self |= 1 << square
    }

    #[inline]
    fn pop(&mut self, square: u32) {
        *self &= !(1 << square)
    }

    #[inline(always)]
    fn foreach(self, mut f: impl FnMut(u32)) {
        let mut bitboard = self;
        while bitboard != 0 {
            let square = bitboard.trailing_zeros();
            f(square);
            bitboard &= bitboard - 1;
        }
    }
}
