use std::io;

use oxchess::{
    position::Position,
    uci::{go::go_cmd, position::position_cmd},
};

fn main() {
    let mut game_state: Option<Position> = None;

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
            ["ucinewgame", ..] => {
                game_state = match position_cmd(&["startpos"]) {
                    Ok(position) => Some(position),
                    Err(e) => {
                        eprintln!("{}", e);
                        continue;
                    }
                }
            }
            ["position", args @ ..] => {
                game_state = match position_cmd(args) {
                    Ok(position) => Some(position),
                    Err(e) => {
                        eprintln!("{}", e);
                        continue;
                    }
                }
            }
            ["go", args @ ..] => {
                if let Some(ref mut game_state) = game_state {
                    let best_move = match go_cmd(game_state, args) {
                        Ok(best_move) => best_move,
                        Err(e) => {
                            eprintln!("{}", e);
                            continue;
                        }
                    };
                    println!("bestmove {}", best_move);
                } else {
                    eprintln!("game not initialized");
                }
            }
            _ => eprintln!("unknown command"),
        }
    }
}
