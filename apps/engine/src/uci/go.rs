use std::{
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
    },
    thread::{self, JoinHandle},
    time::Duration,
};

use thiserror::Error;

use crate::{position::Position, search::Search, types::Move, uci::position::MoveError};

#[derive(Debug, Error)]
pub enum GoCmdError {
    #[error("invalid arguments")]
    InvalidArgs,

    #[error("invalid depth: {0}")]
    InvalidDepth(String),

    #[error("invalid movetime: {0}")]
    InvalidMovetime(String),

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
    match args {
        ["depth", depth] => {
            let depth: u32 = depth
                .parse()
                .map_err(|_| GoCmdError::InvalidDepth(depth.to_string()))?;

            let stop = Arc::new(AtomicBool::new(false));
            let thread = iterative_search(position, Some(depth), stop.clone(), on_done);
            Ok(UciSearch { stop, thread })
        }
        ["infinite"] => {
            let stop = Arc::new(AtomicBool::new(false));
            let thread = iterative_search(position, None, stop.clone(), on_done);
            Ok(UciSearch { stop, thread })
        }
        ["movetime", movetime] => {
            let movetime: u64 = movetime
                .parse()
                .map_err(|_| GoCmdError::InvalidMovetime(movetime.to_string()))?;

            let stop = Arc::new(AtomicBool::new(false));

            let thread_stop = stop.clone();
            thread::spawn(move || {
                thread::sleep(Duration::from_millis(movetime));
                thread_stop.store(true, Ordering::Relaxed)
            });

            let thread = iterative_search(position, None, stop.clone(), on_done);
            Ok(UciSearch { stop, thread })
        }
        [..] => Err(GoCmdError::InvalidArgs),
    }
}

fn iterative_search<F>(
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
