package chess

func (g *Game) Result() GameOver {
	if g.State.HalfMoveCount >= 100 {
		return GameOver{Result: ResultDraw, Reason: FiftyMoveRule}
	}

	if g.isThreefoldRepetition() {
		return GameOver{Result: ResultDraw, Reason: ThreefoldRepetition}
	}

	if g.hasInsufficientMaterial() {
		return GameOver{Result: ResultDraw, Reason: InsufficentMaterial}
	}

	if !g.hasLegalMoves(g.State.ActiveColor) {
		if g.State.Board.inCheck(g.State.ActiveColor) {
			if g.State.ActiveColor == White {
				return GameOver{Result: ResultBlackWon, Reason: Checkmate}
			} else {
				return GameOver{Result: ResultWhiteWon, Reason: Checkmate}
			}
		}

		return GameOver{Result: ResultDraw, Reason: Stalemate}
	}

	return GameOver{Result: ResultGameOngoing, Reason: GameOngoing}
}

func (g *Game) isThreefoldRepetition() bool {
	for _, count := range g.PositionCounts {
		if count >= 3 {
			return true
		}
	}
	return false
}

func (g *Game) hasInsufficientMaterial() bool {
	var whitePieces, blackPieces []Piece

	for row := range 8 {
		for col := range 8 {
			piece := g.State.Board[row][col]
			if piece == nil || piece.Type == King {
				continue
			}
			if piece.Color == White {
				whitePieces = append(whitePieces, *piece)
			} else {
				blackPieces = append(blackPieces, *piece)
			}
		}
	}

	for _, piece := range append(whitePieces, blackPieces...) {
		if piece.Type == Pawn || piece.Type == Rook || piece.Type == Queen {
			return false
		}
	}

	wCount, bCount := len(whitePieces), len(blackPieces)

	if wCount == 0 && bCount == 0 {
		return true
	}
	if (wCount == 0 && bCount == 1) || (wCount == 1 && bCount == 0) {
		return true
	}

	if wCount == 1 && bCount == 1 &&
		whitePieces[0].Type == Bishop && blackPieces[0].Type == Bishop {
		wSquare, bSquare := -1, -1
		for row := range 8 {
			for col := range 8 {
				piece := g.State.Board[row][col]
				if piece == nil {
					continue
				}
				if piece.Type == Bishop && piece.Color == White {
					wSquare = (row + col) % 2
				}
				if piece.Type == Bishop && piece.Color == Black {
					bSquare = (row + col) % 2
				}
			}
		}
		if wSquare == bSquare {
			return true
		}
	}
	return false
}

func (g *Game) hasLegalMoves(color Color) bool {
	board := g.State.Board
	for row := range 8 {
		for col := range 8 {
			piece := board[row][col]
			if piece == nil || piece.Color != color {
				continue
			}

			for _, sq := range board.pseudoLegalPieceMoves(row, col) {
				from := rcToSquare(row, col)
				to := rcToSquare(sq[0], sq[1])
				if g.IsMoveValid(Move{From: from, To: to}) {
					return true
				}
			}

			if piece.Type == Pawn && g.State.EnPassantTarget != "" {
				epRow, epCol := squareToRC(g.State.EnPassantTarget)
				fwd := 1
				if color == Black {
					fwd = -1
				}

				if epRow == row+fwd && (epCol == col-1 || epCol == col+1) {
					from := rcToSquare(row, col)
					to := g.State.EnPassantTarget
					if g.IsMoveValid(Move{From: from, To: to}) {
						return true
					}
				}
			}
		}
	}
	return false
}
