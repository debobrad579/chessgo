package chess

import "strings"

func (g *Game) Move(move Move) {
	fromRow, fromCol := squareToRC(move.From)
	toRow, toCol := squareToRC(move.To)
	piece := g.State.Board[fromRow][fromCol]

	g.State.EnPassantTarget = ""

	if piece == nil {
		return
	}

	if piece.Type == Pawn && fromCol != toCol && g.State.Board[toRow][toCol] == nil {
		g.State.Board[fromRow][toCol] = nil
	}

	if piece.Type == King {
		deltaCol := toCol - fromCol

		if deltaCol == 2 {
			g.State.Board[fromRow][5] = g.State.Board[fromRow][7]
			g.State.Board[fromRow][7] = nil
		} else if deltaCol == -2 {
			g.State.Board[fromRow][3] = g.State.Board[fromRow][0]
			g.State.Board[fromRow][0] = nil
		}

		if piece.Color == White {
			g.State.CastlingRights = strings.ReplaceAll(g.State.CastlingRights, "K", "")
			g.State.CastlingRights = strings.ReplaceAll(g.State.CastlingRights, "Q", "")
		} else {
			g.State.CastlingRights = strings.ReplaceAll(g.State.CastlingRights, "k", "")
			g.State.CastlingRights = strings.ReplaceAll(g.State.CastlingRights, "q", "")
		}
	}

	if piece.Type == Rook {
		switch {
		case fromRow == 0 && fromCol == 0:
			g.State.CastlingRights = strings.ReplaceAll(g.State.CastlingRights, "Q", "")
		case fromRow == 0 && fromCol == 7:
			g.State.CastlingRights = strings.ReplaceAll(g.State.CastlingRights, "K", "")
		case fromRow == 7 && fromCol == 0:
			g.State.CastlingRights = strings.ReplaceAll(g.State.CastlingRights, "q", "")
		case fromRow == 7 && fromCol == 7:
			g.State.CastlingRights = strings.ReplaceAll(g.State.CastlingRights, "k", "")
		}
	}

	g.State.Board[toRow][toCol] = piece
	g.State.Board[fromRow][fromCol] = nil

	if piece.Type == Pawn {
		if (piece.Color == White && toRow == 7) || (piece.Color == Black && toRow == 0) {
			promotionType := Queen

			if move.Promotion != nil {
				promotionType = *move.Promotion
			}

			g.State.Board[toRow][toCol] = &Piece{Type: promotionType, Color: piece.Color}
		}

		if abs(toRow-fromRow) == 2 {
			enpassantRow := (fromRow + toRow) / 2
			g.State.EnPassantTarget = string(rune('a'+fromCol)) + string(rune('1'+enpassantRow))
		}
	}

	if g.State.ActiveColor == White {
		g.State.ActiveColor = Black
	} else {
		g.State.ActiveColor = White
	}

	g.Moves = append(g.Moves, move)
}

func (b Board) getBoardAfterMove(move Move) Board {
	fromRow, fromCol := squareToRC(move.From)
	toRow, toCol := squareToRC(move.To)
	piece := b[fromRow][fromCol]

	if piece != nil && piece.Type == Pawn && fromCol != toCol && b[toRow][toCol] == nil {
		b[fromRow][toCol] = nil
	}

	if piece != nil && piece.Type == King {
		deltaCol := toCol - fromCol

		if deltaCol == 2 {
			b[fromRow][5] = b[fromRow][7]
			b[fromRow][7] = nil
		} else if deltaCol == -2 {
			b[fromRow][3] = b[fromRow][0]
			b[fromRow][0] = nil
		}
	}

	b[toRow][toCol] = piece
	b[fromRow][fromCol] = nil

	if piece != nil && piece.Type == Pawn {
		if (piece.Color == White && toRow == 7) || (piece.Color == Black && toRow == 0) {
			promotionType := Queen

			if move.Promotion != nil {
				promotionType = *move.Promotion
			}

			b[toRow][toCol] = &Piece{Type: promotionType, Color: piece.Color}
		}
	}

	return b
}
