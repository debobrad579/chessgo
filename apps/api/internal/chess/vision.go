package chess

func (b Board) canSee(row, col, toRow, toCol int, piece *Piece) bool {
	deltaRow := toRow - row
	deltaCol := toCol - col

	switch piece.Type {
	case Pawn:
		fwd := 1
		if piece.Color == Black {
			fwd = -1
		}
		return deltaRow == fwd && abs(deltaCol) == 1
	case Knight:
		return (abs(deltaRow) == 2 && abs(deltaCol) == 1) || (abs(deltaRow) == 1 && abs(deltaCol) == 2)
	case Bishop:
		return abs(deltaRow) == abs(deltaCol) && b.pathIsClear(row, col, toRow, toCol)
	case Rook:
		return (deltaRow == 0 || deltaCol == 0) && b.pathIsClear(row, col, toRow, toCol)
	case Queen:
		return (abs(deltaRow) == abs(deltaCol) || deltaRow == 0 || deltaCol == 0) && b.pathIsClear(row, col, toRow, toCol)
	case King:
		return abs(deltaRow) <= 1 && abs(deltaCol) <= 1
	}

	return false
}

func (b Board) pathIsClear(row1, col1, row2, col2 int) bool {
	deltaRow, deltaCol := 0, 0

	if row2 > row1 {
		deltaRow = 1
	} else if row2 < row1 {
		deltaRow = -1
	}

	if col2 > col1 {
		deltaCol = 1
	} else if col2 < col1 {
		deltaCol = -1
	}

	row, col := row1+deltaRow, col1+deltaCol

	for row != row2 || col != col2 {
		if b[row][col] != nil {
			return false
		}
		row += deltaRow
		col += deltaCol
	}

	return true
}
