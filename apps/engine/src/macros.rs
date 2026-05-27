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
