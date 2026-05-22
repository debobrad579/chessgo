use std::io;

use engine::state::State;

fn main() {
    let mut game_state: Option<State> = None;

    loop {
        let mut input = String::new();
        io::stdin()
            .read_line(&mut input)
            .expect("Failed to read line");

        match input.split_whitespace().collect::<Vec<_>>().as_slice() {
            ["quit", ..] => break,
            ["uci", ..] => {
                println!("id name Engine");
                println!("id author debobrad579");
                println!("uciok");
            }
            ["isready", ..] => println!("readyok"),
            ["ucinewgame", ..] => {
                game_state = match State::from_position_cmd(&["startpos"]) {
                    Ok(state) => Some(state),
                    Err(e) => {
                        eprintln!("{}", e);
                        continue;
                    }
                }
            }
            ["position", args @ ..] => {
                game_state = match State::from_position_cmd(args) {
                    Ok(state) => Some(state),
                    Err(e) => {
                        eprintln!("{}", e);
                        continue;
                    }
                }
            }
            ["go", args @ ..] => {
                if let Some(game_state) = game_state {
                    let best_move = match game_state.go(args) {
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
