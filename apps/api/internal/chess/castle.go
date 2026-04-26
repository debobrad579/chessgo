package chess

import "strings"

func (b Board) canCastle(rights string, color Color, kingside bool) bool {
	var right string
	if color == White {
		if kingside {
			right = "K"
		} else {
			right = "Q"
		}
	} else {
		if kingside {
			right = "k"
		} else {
			right = "q"
		}
	}
	if !strings.Contains(rights, right) {
		return false
	}
	row := 0
	if color == Black {
		row = 7
	}
	if kingside {
		if b[row][5] != nil || b[row][6] != nil {
			return false
		}
	} else {
		if b[row][1] != nil || b[row][2] != nil || b[row][3] != nil {
			return false
		}
	}
	if b.inCheck(color) {
		return false
	}
	passThroughCol, destCol := 5, 6
	if !kingside {
		passThroughCol, destCol = 3, 2
	}

	throughBoard := b
	throughBoard[row][passThroughCol] = throughBoard[row][4]
	throughBoard[row][4] = nil
	if throughBoard.inCheck(color) {
		return false
	}

	destBoard := b
	destBoard[row][destCol] = destBoard[row][4]
	destBoard[row][4] = nil
	return !destBoard.inCheck(color)
}
