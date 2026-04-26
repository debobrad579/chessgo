package chess

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMoveBasicPawnPush(t *testing.T) {
	g := newGame()
	g.Move(Move{From: "e2", To: "e4"})

	assert.Nil(t, g.State.Board[1][4])
	assert.Equal(t, &Piece{Pawn, White}, g.State.Board[3][4])
	assert.Equal(t, Black, g.State.ActiveColor)
	assert.Equal(t, "e3", g.State.EnPassantTarget)
}

func TestEnPassantCapture(t *testing.T) {
	var b Board
	place(&b, 4, 4, Pawn, White)
	place(&b, 4, 3, Pawn, Black)
	place(&b, 0, 4, King, White)
	place(&b, 7, 0, King, Black)

	g := &Game{State: GameState{
		Board:           b,
		ActiveColor:     White,
		CastlingRights:  "",
		EnPassantTarget: "d6",
	}}
	g.Move(Move{From: "e5", To: "d6"})

	assert.Nil(t, g.State.Board[4][3])
	assert.Equal(t, &Piece{Pawn, White}, g.State.Board[5][3])
}

func TestWhiteKingsideCastle(t *testing.T) {
	var b Board
	place(&b, 0, 4, King, White)
	place(&b, 0, 7, Rook, White)
	place(&b, 7, 0, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: "KQ"}}
	g.Move(Move{From: "e1", To: "g1"})

	assert.Equal(t, &Piece{King, White}, g.State.Board[0][6])
	assert.Equal(t, &Piece{Rook, White}, g.State.Board[0][5])
	assert.Nil(t, g.State.Board[0][7])
	assert.Nil(t, g.State.Board[0][4])
	assert.NotContains(t, g.State.CastlingRights, "K")
	assert.NotContains(t, g.State.CastlingRights, "Q")
}

func TestWhiteQueensideCastle(t *testing.T) {
	var b Board
	place(&b, 0, 4, King, White)
	place(&b, 0, 0, Rook, White)
	place(&b, 7, 0, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: "KQ"}}
	g.Move(Move{From: "e1", To: "c1"})

	assert.Equal(t, &Piece{King, White}, g.State.Board[0][2])
	assert.Equal(t, &Piece{Rook, White}, g.State.Board[0][3])
	assert.Nil(t, g.State.Board[0][0])
}

func TestBlackKingsideCastle(t *testing.T) {
	var b Board
	place(&b, 7, 4, King, Black)
	place(&b, 7, 7, Rook, Black)
	place(&b, 0, 4, King, White)

	g := &Game{State: GameState{Board: b, ActiveColor: Black, CastlingRights: "kq"}}
	g.Move(Move{From: "e8", To: "g8"})

	assert.Equal(t, &Piece{King, Black}, g.State.Board[7][6])
	assert.Equal(t, &Piece{Rook, Black}, g.State.Board[7][5])
	assert.Nil(t, g.State.Board[7][7])
	assert.NotContains(t, g.State.CastlingRights, "k")
	assert.NotContains(t, g.State.CastlingRights, "q")
}

func TestRookMoveLosesCastlingRight(t *testing.T) {
	g := newGame()
	g.State.Board[0][5] = nil
	g.State.Board[0][6] = nil
	g.Move(Move{From: "h1", To: "g1"})
	assert.NotContains(t, g.State.CastlingRights, "K")
	assert.Contains(t, g.State.CastlingRights, "Q")
}

func TestPromotion(t *testing.T) {
	var b Board
	place(&b, 6, 4, Pawn, White)
	place(&b, 0, 4, King, White)
	place(&b, 7, 0, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}
	g.Move(Move{From: "e7", To: "e8", Promotion: prom(Queen)})

	promoted := g.State.Board[7][4]
	require.NotNil(t, promoted)
	assert.Equal(t, Queen, promoted.Type)
	assert.Equal(t, White, promoted.Color)
}

func TestPromotionDefaultsToQueen(t *testing.T) {
	var b Board
	place(&b, 6, 4, Pawn, White)
	place(&b, 0, 4, King, White)
	place(&b, 7, 0, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}
	g.Move(Move{From: "e7", To: "e8"})

	promoted := g.State.Board[7][4]
	require.NotNil(t, promoted)
	assert.Equal(t, Queen, promoted.Type)
}

func TestActiveColorAlternates(t *testing.T) {
	g := newGame()
	assert.Equal(t, White, g.State.ActiveColor)
	g.Move(Move{From: "e2", To: "e4"})
	assert.Equal(t, Black, g.State.ActiveColor)
	g.Move(Move{From: "e7", To: "e5"})
	assert.Equal(t, White, g.State.ActiveColor)
}

func TestRecordedInMovesSlice(t *testing.T) {
	g := newGame()
	m := Move{From: "e2", To: "e4"}
	g.Move(m)
	require.Len(t, g.Moves, 1)
	assert.Equal(t, m, g.Moves[0])
}

func TestGetBoardAfterMoveDoesNotMutateOriginal(t *testing.T) {
	b := NewGameState().Board
	original := b[1][4]

	newB := b.getBoardAfterMove(Move{From: "e2", To: "e4"})

	assert.Equal(t, original, b[1][4])
	assert.Nil(t, b[3][4])

	assert.Nil(t, newB[1][4])
	assert.Equal(t, &Piece{Pawn, White}, newB[3][4])
}
