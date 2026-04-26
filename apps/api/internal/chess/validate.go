package chess

func (g Game) IsMoveValid(move Move) bool {
	b := g.State.Board
	color := g.State.ActiveColor

	if len(move.From) != 2 || len(move.To) != 2 {
		return false
	}
	fromR, fromC := squareToRC(move.From)
	toRow, toCol := squareToRC(move.To)

	if fromR < 0 || fromR > 7 || fromC < 0 || fromC > 7 || toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7 {
		return false
	}

	piece := b[fromR][fromC]
	if piece == nil || piece.Color != color {
		return false
	}

	isEnPassant := false
	if piece.Type == Pawn && fromC != toCol && b[toRow][toCol] == nil {
		if g.State.EnPassantTarget == move.To {
			isEnPassant = true
		}
		if !isEnPassant {
			return false
		}
	}

	isCastle := false
	if piece.Type == King && abs(toCol-fromC) == 2 {
		isCastle = true
		if !g.State.Board.canCastle(g.State.CastlingRights, color, toCol > fromC) {
			return false
		}
	}

	if !isCastle && !isEnPassant {
		legal := false
		for _, sq := range g.State.Board.pseudoLegalPieceMoves(fromR, fromC) {
			if sq[0] == toRow && sq[1] == toCol {
				legal = true
				break
			}
		}
		if !legal {
			return false
		}
	}

	newBoard := g.State.Board.getBoardAfterMove(move)
	return !newBoard.inCheck(color)
}
