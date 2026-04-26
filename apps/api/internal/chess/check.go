package chess

func (b Board) inCheck(color Color) bool {
	kingRow, kingCol := -1, -1
	for row := range 8 {
		for col := range 8 {
			if piece := b[row][col]; piece != nil && piece.Type == King && piece.Color == color {
				kingRow, kingCol = row, col
			}
		}
	}

	if kingRow == -1 {
		return true
	}

	for row := range 8 {
		for col := range 8 {
			if piece := b[row][col]; piece != nil && piece.Color != color {
				if b.canSee(row, col, kingRow, kingCol, piece) {
					return true
				}
			}
		}
	}
	return false
}
