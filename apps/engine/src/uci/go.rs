use std::{
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
    },
    thread::{self, JoinHandle},
    time::Duration,
};

use thiserror::Error;

use crate::{
    position::Position,
    search::Search,
    types::{Color, Move},
    uci::position::MoveError,
};

#[derive(Debug, Error)]
pub enum GoCmdError {
    #[error("invalid arguments")]
    InvalidArgs,

    #[error(transparent)]
    MoveError(#[from] MoveError),
}

pub struct UciSearch {
    stop: Arc<AtomicBool>,
    thread: JoinHandle<()>,
}

impl UciSearch {
    pub fn stop(self) {
        self.stop.store(true, Ordering::Relaxed);
        let _ = self.thread.join();
    }
}

pub fn go_cmd<F>(position: Position, args: &[&str], on_done: F) -> Result<UciSearch, GoCmdError>
where
    F: FnOnce(Option<Move>) + Send + 'static,
{
    let mut max_depth: Option<u32> = None;
    let mut movetime: Option<u64> = None;
    let mut wtime: Option<u64> = None;
    let mut btime: Option<u64> = None;
    let mut winc: u64 = 0;
    let mut binc: u64 = 0;

    let mut iter = args.iter();

    while let Some(arg) = iter.next() {
        if *arg == "infinite" {
            continue;
        }

        let value = iter.next().and_then(|v| v.parse::<u64>().ok());

        match (*arg, value) {
            ("depth", Some(v)) => max_depth = Some(v as u32),
            ("movetime", Some(v)) => movetime = Some(v),
            ("wtime", Some(v)) => wtime = Some(v),
            ("btime", Some(v)) => btime = Some(v),
            ("winc", Some(v)) => winc = v,
            ("binc", Some(v)) => binc = v,
            ("movestogo", Some(_)) => {}
            _ => return Err(GoCmdError::InvalidArgs),
        }
    }

    let (time, inc) = if position.turn() == Color::White {
        (wtime, winc)
    } else {
        (btime, binc)
    };

    let movetime = if movetime.is_some() {
        movetime
    } else {
        time.map(|time| time / 20 + inc / 2)
    };

    let stop = Arc::new(AtomicBool::new(false));

    if let Some(movetime) = movetime {
        schedule_stop(movetime, stop.clone());
    }

    let thread = iterative_deepening_search(position, max_depth, stop.clone(), on_done);
    Ok(UciSearch { stop, thread })
}

fn schedule_stop(movetime: u64, stop: Arc<AtomicBool>) {
    thread::spawn(move || {
        thread::sleep(Duration::from_millis(movetime));
        stop.store(true, Ordering::Relaxed)
    });
}

fn iterative_deepening_search<F>(
    mut position: Position,
    max_depth: Option<u32>,
    stop: Arc<AtomicBool>,
    on_done: F,
) -> JoinHandle<()>
where
    F: FnOnce(Option<Move>) + Send + 'static,
{
    thread::spawn(move || {
        let mut search = Search::new(stop);
        let mut current_depth = 1;
        let mut bestmove: Option<Move> = None;

        loop {
            if let Some(max_depth) = max_depth
                && max_depth < current_depth
            {
                break;
            }

            search.negamax(
                &mut position,
                current_depth,
                -2_000_000_000,
                2_000_000_000,
                0,
            );

            if search.stopped() {
                break;
            }

            bestmove = search.bestmove();
            current_depth += 1;
        }

        on_done(bestmove);
    })
}
