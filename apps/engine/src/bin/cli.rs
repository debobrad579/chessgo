use std::io;

use oxchess::{
    position::Position,
    uci::{
        go::{UciSearch, go_cmd},
        position::position_cmd,
    },
};

fn main() {
    let mut current_position: Option<Position> = None;
    let mut current_search: Option<UciSearch> = None;

    loop {
        let mut input = String::new();
        io::stdin()
            .read_line(&mut input)
            .expect("Failed to read line");

        match input.split_whitespace().collect::<Vec<_>>().as_slice() {
            ["quit", ..] => break,
            ["uci", ..] => {
                println!("id name OxChess");
                println!("id author Brady DeBoer");
                println!("uciok");
            }
            ["isready", ..] => println!("readyok"),
            ["ucinewgame"] => {
                current_position = match position_cmd(&["startpos"]) {
                    Ok(position) => Some(position),
                    Err(e) => {
                        eprintln!("{}", e);
                        continue;
                    }
                }
            }
            ["position", args @ ..] => {
                current_position = match position_cmd(args) {
                    Ok(position) => Some(position),
                    Err(e) => {
                        eprintln!("{}", e);
                        continue;
                    }
                }
            }
            ["go", args @ ..] => {
                if let Some(ref mut game_state) = current_position {
                    if let Some(search) = current_search.take() {
                        search.stop();
                    }

                    match go_cmd(game_state.clone(), args, |bestmove| {
                        if let Some(bestmove) = bestmove {
                            println!("bestmove {}", bestmove);
                        } else {
                            eprintln!("no legal moves")
                        }
                    }) {
                        Ok(search) => current_search = Some(search),
                        Err(e) => eprintln!("{}", e),
                    };
                } else {
                    eprintln!("game not initialized");
                }
            }
            ["stop"] => {
                if let Some(search) = current_search.take() {
                    search.stop();
                }
            }
            _ => eprintln!("unknown command"),
        }
    }
}
