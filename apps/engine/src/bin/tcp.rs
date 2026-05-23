use std::{
    env,
    io::{BufRead, BufReader, Write},
    net::{TcpListener, TcpStream},
    thread,
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

    println!("Connected: {}", peer);

    loop {
        let mut line = String::new();

        match reader.read_line(&mut line) {
            Ok(0) => {
                println!("Client disconnected");
                break;
            }
            Ok(_) => {
                let cmd = line.trim();

                println!("UCI: {}", cmd);

                match cmd {
                    "uci" => {
                        writeln!(stream, "id name OxChess").unwrap();
                        writeln!(stream, "id author Brady DeBoer").unwrap();
                        writeln!(stream, "uciok").unwrap();
                    }
                    "isready" => {
                        writeln!(stream, "readyok").unwrap();
                    }
                    "quit" => {
                        println!("Quit received");
                        break;
                    }
                    _ => {}
                }
            }
            Err(e) => {
                eprintln!("Read error: {}", e);
                break;
            }
        }
    }

    println!("Connection closed: {}", peer);
}
