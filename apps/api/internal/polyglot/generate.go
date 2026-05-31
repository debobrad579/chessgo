package polyglot

import (
	"strings"

	"github.com/debobrad579/chessgo/internal/chess"
)

func GetZobristKey(state *chess.GameState) (key uint64) {
	for row := range 8 {
		for file := range 8 {
			piece := state.Board[row][file]
			if piece != nil {
				key ^= keyArray[getPieceOffset(piece, row, file)]
			}
		}
	}

	if strings.Contains(state.CastlingRights, "K") {
		key ^= keyArray[768]
	}

	if strings.Contains(state.CastlingRights, "Q") {
		key ^= keyArray[769]
	}

	if strings.Contains(state.CastlingRights, "k") {
		key ^= keyArray[770]
	}

	if strings.Contains(state.CastlingRights, "q") {
		key ^= keyArray[771]
	}
	if file := enpassantFile(state); file >= 0 {
		key ^= keyArray[772+file]
	}

	if state.ActiveColor == chess.White {
		key ^= keyArray[780]
	}

	return key
}

func getPieceOffset(piece *chess.Piece, row, file int) int {
	pieceType := 0

	if piece.Color == chess.White {
		pieceType = 1
	}

	switch piece.Type {
	case chess.Knight:
		pieceType += 2
	case chess.Bishop:
		pieceType += 4
	case chess.Rook:
		pieceType += 6
	case chess.Queen:
		pieceType += 8
	case chess.King:
		pieceType += 10
	}

	square := row*8 + file

	return pieceType*64 + square
}

func enpassantFile(state *chess.GameState) int {
	if state.EnPassantTarget == "" {
		return -1
	}

	file := int(state.EnPassantTarget[0] - 'a')
	rank := int(state.EnPassantTarget[1] - '1')

	if state.ActiveColor == chess.White {
		if file > 0 {
			piece := state.Board[rank-1][file-1]
			if piece != nil && piece.Color == chess.White && piece.Type == chess.Pawn {
				return file
			}
		}
		if file < 7 {
			piece := state.Board[rank-1][file+1]
			if piece != nil && piece.Color == chess.White && piece.Type == chess.Pawn {
				return file
			}
		}
	} else {
		if file > 0 {
			piece := state.Board[rank+1][file-1]
			if piece != nil && piece.Color == chess.Black && piece.Type == chess.Pawn {
				return file
			}
		}
		if file < 7 {
			piece := state.Board[rank+1][file+1]
			if piece != nil && piece.Color == chess.Black && piece.Type == chess.Pawn {
				return file
			}
		}
	}

	return -1
}
