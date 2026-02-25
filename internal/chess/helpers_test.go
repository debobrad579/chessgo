package chess

func emptyBoard() Board {
	var b Board
	return b
}

func place(b *Board, row, col int, pt PieceType, c Color) {
	b[row][col] = &Piece{Type: pt, Color: c}
}

func prom(pt PieceType) *PieceType { return &pt }

func newGame() *Game {
	state := NewGameState()
	return &Game{State: state}
}
