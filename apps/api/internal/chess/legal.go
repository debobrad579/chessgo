package chess

func (b Board) pseudoLegalPieceMoves(row, col int) [][2]int {
	piece := b[row][col]
	if piece == nil {
		return nil
	}
	var moves [][2]int

	addIfOnBoard := func(toRow, toCol int) bool {
		if toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7 {
			return false
		}
		target := b[toRow][toCol]
		if target != nil && target.Color == piece.Color {
			return false
		}
		moves = append(moves, [2]int{toRow, toCol})
		return target == nil
	}

	switch piece.Type {
	case Pawn:
		fwd := 1
		startRow := 1
		if piece.Color == Black {
			fwd = -1
			startRow = 6
		}

		if row+fwd >= 0 && row+fwd <= 7 && b[row+fwd][col] == nil {
			moves = append(moves, [2]int{row + fwd, col})

			if row == startRow && b[row+2*fwd][col] == nil {
				moves = append(moves, [2]int{row + 2*fwd, col})
			}
		}

		for _, deltaCol := range []int{-1, 1} {
			toCol := col + deltaCol
			toRow := row + fwd
			if toCol >= 0 && toCol <= 7 && toRow >= 0 && toRow <= 7 {
				target := b[toRow][toCol]
				if target != nil && target.Color != piece.Color {
					moves = append(moves, [2]int{toRow, toCol})
				}
			}
		}
	case Knight:
		for _, d := range [][2]int{{-2, -1}, {-2, 1}, {-1, -2}, {-1, 2}, {1, -2}, {1, 2}, {2, -1}, {2, 1}} {
			addIfOnBoard(row+d[0], col+d[1])
		}
	case Bishop:
		for _, d := range [][2]int{{1, 1}, {1, -1}, {-1, 1}, {-1, -1}} {
			for i := 1; i < 8; i++ {
				if !addIfOnBoard(row+d[0]*i, col+d[1]*i) {
					break
				}
			}
		}
	case Rook:
		for _, d := range [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}} {
			for i := 1; i < 8; i++ {
				if !addIfOnBoard(row+d[0]*i, col+d[1]*i) {
					break
				}
			}
		}
	case Queen:
		for _, d := range [][2]int{{1, 1}, {1, -1}, {-1, 1}, {-1, -1}, {1, 0}, {-1, 0}, {0, 1}, {0, -1}} {
			for i := 1; i < 8; i++ {
				if !addIfOnBoard(row+d[0]*i, col+d[1]*i) {
					break
				}
			}
		}
	case King:
		for _, d := range [][2]int{{1, 1}, {1, -1}, {-1, 1}, {-1, -1}, {1, 0}, {-1, 0}, {0, 1}, {0, -1}} {
			addIfOnBoard(row+d[0], col+d[1])
		}
	}
	return moves
}
