package chess

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInvalidSquareFormat(t *testing.T) {
	g := newGame()
	assert.False(t, g.IsMoveValid(Move{From: "e", To: "e4"}))
	assert.False(t, g.IsMoveValid(Move{From: "e2", To: "e"}))
}

func TestInvalidEmptySquare(t *testing.T) {
	g := newGame()
	assert.False(t, g.IsMoveValid(Move{From: "e4", To: "e5"}))
}

func TestInvalidWrongColorPiece(t *testing.T) {
	g := newGame()
	assert.False(t, g.IsMoveValid(Move{From: "e7", To: "e5"}))
}

func TestValidWhitePawnDoublePush(t *testing.T) {
	g := newGame()
	assert.True(t, g.IsMoveValid(Move{From: "e2", To: "e4"}))
}

func TestValidWhitePawnSinglePush(t *testing.T) {
	g := newGame()
	assert.True(t, g.IsMoveValid(Move{From: "e2", To: "e3"}))
}

func TestInvalidPawnPushThroughPiece(t *testing.T) {
	g := newGame()
	g.State.Board[2][4] = &Piece{Pawn, Black}
	assert.False(t, g.IsMoveValid(Move{From: "e2", To: "e4"}))
}

func TestValidKnightMove(t *testing.T) {
	g := newGame()
	assert.True(t, g.IsMoveValid(Move{From: "b1", To: "c3"}))
}

func TestValidWhiteKingsideCastle(t *testing.T) {
	g := newGame()
	g.State.Board[0][5] = nil
	g.State.Board[0][6] = nil
	assert.True(t, g.IsMoveValid(Move{From: "e1", To: "g1"}))
}

func TestValidWhiteQueensideCastle(t *testing.T) {
	g := newGame()
	g.State.Board[0][1] = nil
	g.State.Board[0][2] = nil
	g.State.Board[0][3] = nil
	assert.True(t, g.IsMoveValid(Move{From: "e1", To: "c1"}))
}

func TestInvalidMoveLeavesKingInCheck(t *testing.T) {
	var b Board
	place(&b, 0, 4, King, White)
	place(&b, 4, 4, Rook, White)
	place(&b, 7, 4, Rook, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}
	assert.False(t, g.IsMoveValid(Move{From: "e5", To: "d5"}))
}

func TestValidPromotionRequired(t *testing.T) {
	var b Board
	place(&b, 6, 4, Pawn, White)
	place(&b, 0, 4, King, White)
	place(&b, 7, 0, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}
	assert.False(t, g.IsMoveValid(Move{From: "e7", To: "e8"}))
	assert.True(t, g.IsMoveValid(Move{From: "e7", To: "e8", Promotion: prom(Queen)}))
}

func TestInvalidPromotionPiece(t *testing.T) {
	var b Board
	place(&b, 6, 4, Pawn, White)
	place(&b, 0, 4, King, White)
	place(&b, 7, 0, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}
	assert.False(t, g.IsMoveValid(Move{From: "e7", To: "e8", Promotion: prom(King)}))
	assert.False(t, g.IsMoveValid(Move{From: "e7", To: "e8", Promotion: prom(Pawn)}))
}

func TestInvalidPromotionOnWrongRank(t *testing.T) {
	g := newGame()
	assert.False(t, g.IsMoveValid(Move{From: "e2", To: "e4", Promotion: prom(Queen)}))
}

func TestValidEnPassant(t *testing.T) {
	var b Board
	place(&b, 4, 4, Pawn, White) // e5
	place(&b, 4, 5, Pawn, Black) // f5
	place(&b, 0, 4, King, White)
	place(&b, 7, 0, King, Black)

	g := &Game{State: GameState{
		Board:           b,
		ActiveColor:     White,
		CastlingRights:  "",
		EnPassantTarget: "f6",
	}}
	assert.True(t, g.IsMoveValid(Move{From: "e5", To: "f6"}))
}

func TestInvalidEnPassantWrongTarget(t *testing.T) {
	var b Board
	place(&b, 4, 4, Pawn, White)
	place(&b, 4, 5, Pawn, Black)
	place(&b, 0, 4, King, White)
	place(&b, 7, 0, King, Black)

	g := &Game{State: GameState{
		Board:           b,
		ActiveColor:     White,
		CastlingRights:  "",
		EnPassantTarget: "g6",
	}}
	assert.False(t, g.IsMoveValid(Move{From: "e5", To: "f6"}))
}
