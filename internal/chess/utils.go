package chess

func fileToCol(file byte) int { return int(file - 'a') }
func rankToRow(rank byte) int { return int(rank - '1') }

func squareToRC(square string) (int, int) {
	return rankToRow(square[1]), fileToCol(square[0])
}

func rcToSquare(row, col int) string {
	return string(rune('a'+col)) + string(rune('1'+row))
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func NewGameState() GameState {
	var board Board

	backRank := []PieceType{Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook}
	for col, pieceType := range backRank {
		board[0][col] = &Piece{Type: pieceType, Color: White}
		board[7][col] = &Piece{Type: pieceType, Color: Black}
	}

	for col := range 8 {
		board[1][col] = &Piece{Type: Pawn, Color: White}
		board[6][col] = &Piece{Type: Pawn, Color: Black}
	}

	return GameState{
		Board:           board,
		ActiveColor:     White,
		EnPassantTarget: "",
		CastlingRights:  "KQkq",
	}
}

func (g *Game) Turn() Color {
	if len(g.Moves)%2 == 0 {
		return White
	}
	return Black
}
