use std::{
    env,
    io::{BufRead, BufReader, Write},
    net::{TcpListener, TcpStream},
    thread,
};

use oxchess::{
    position::Position,
    uci::{
        go::{UciSearch, go_cmd},
        position::position_cmd,
    },
};

fn main() {
    let addr = env::var("URL").unwrap_or("127.0.0.1:9000".to_string());
    let listener = TcpListener::bind(&addr).expect("Failed to bind to address");
    println!("Server listening on {}", addr);

    for stream_result in listener.incoming() {
        match stream_result {
            Ok(stream) => {
                thread::spawn(move || {
                    handle_client(stream);
                });
            }
            Err(e) => {
                eprintln!("Failed to accept connection: {}", e);
            }
        }
    }
}

fn handle_client(mut stream: TcpStream) {
    let peer = stream.peer_addr().unwrap();

    let reader_stream = stream.try_clone().unwrap();
    let mut reader = BufReader::new(reader_stream);

    let mut current_position: Option<Position> = None;
    let mut current_search: Option<UciSearch> = None;

    println!("Connected: {}", peer);

    loop {
        let mut line = String::new();

        match reader.read_line(&mut line) {
            Ok(0) => {
                println!("Client disconnected");
                break;
            }
            Ok(_) => match line.split_whitespace().collect::<Vec<_>>().as_slice() {
                ["quit"] => break,
                ["uci"] => {
                    writeln!(stream, "id name OxChess").unwrap();
                    writeln!(stream, "id author Brady DeBoer").unwrap();
                    writeln!(stream, "uciok").unwrap();
                }
                ["isready"] => {
                    writeln!(stream, "readyok").unwrap();
                }
                ["ucinewgame", ..] => {
                    current_position = match position_cmd(&["startpos"]) {
                        Ok(position) => Some(position),
                        Err(e) => {
                            writeln!(stream, "{}", e).unwrap();
                            continue;
                        }
                    }
                }
                ["position", args @ ..] => {
                    current_position = match position_cmd(args) {
                        Ok(position) => Some(position),
                        Err(e) => {
                            writeln!(stream, "{}", e).unwrap();
                            continue;
                        }
                    }
                }
                ["go", args @ ..] => {
                    if let Some(game_state) = current_position.as_ref() {
                        if let Some(search) = current_search.take() {
                            search.stop();
                        }

                        let mut out = match stream.try_clone() {
                            Ok(s) => s,
                            Err(e) => {
                                writeln!(stream, "failed to clone stream: {}", e).unwrap();
                                continue;
                            }
                        };

                        match go_cmd(game_state.clone(), args, move |bestmove| {
                            if let Some(bestmove) = bestmove {
                                writeln!(out, "bestmove {}", bestmove).unwrap();
                            } else {
                                writeln!(out, "no legal moves").unwrap();
                            }
                        }) {
                            Ok(search) => current_search = Some(search),
                            Err(e) => writeln!(stream, "{}", e).unwrap(),
                        };
                    } else {
                        writeln!(stream, "game not initialized").unwrap();
                    }
                }
                ["stop"] => {
                    if let Some(search) = current_search.take() {
                        search.stop();
                    }
                }
                _ => writeln!(stream, "unknown command").unwrap(),
            },
            Err(e) => {
                eprintln!("Read error: {}", e);
                break;
            }
        }
    }

    println!("Connection closed: {}", peer);
}
