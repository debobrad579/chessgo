package chess

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCastleWhiteKingside(t *testing.T) {
	gs := NewGameState()
	gs.Board[0][5] = nil
	gs.Board[0][6] = nil
	assert.True(t, gs.Board.canCastle("KQkq", White, true))
}

func TestCastleWhiteQueenside(t *testing.T) {
	gs := NewGameState()
	gs.Board[0][1] = nil
	gs.Board[0][2] = nil
	gs.Board[0][3] = nil
	assert.True(t, gs.Board.canCastle("KQkq", White, false))
}

func TestCastleMissingRight(t *testing.T) {
	gs := NewGameState()
	gs.Board[0][5] = nil
	gs.Board[0][6] = nil
	assert.False(t, gs.Board.canCastle("Q", White, true))
}

func TestCastlePieceInTheWay(t *testing.T) {
	gs := NewGameState()
	assert.False(t, gs.Board.canCastle("KQkq", White, true))
}

func TestCastleInCheck(t *testing.T) {
	b := emptyBoard()
	place(&b, 0, 4, King, White)
	place(&b, 0, 7, Rook, White)
	place(&b, 7, 4, Rook, Black)
	assert.False(t, b.canCastle("K", White, true))
}

func TestCastleThroughCheck(t *testing.T) {
	b := emptyBoard()
	place(&b, 0, 4, King, White)
	place(&b, 0, 7, Rook, White)
	place(&b, 7, 5, Rook, Black)
	assert.False(t, b.canCastle("K", White, true))
}

func TestCastleIntoCheck(t *testing.T) {
	b := emptyBoard()
	place(&b, 0, 4, King, White)
	place(&b, 0, 7, Rook, White)
	place(&b, 7, 6, Rook, Black)
	assert.False(t, b.canCastle("K", White, true))
}

func TestCastleBlackKingside(t *testing.T) {
	b := emptyBoard()
	place(&b, 7, 4, King, Black)
	place(&b, 7, 7, Rook, Black)
	assert.True(t, b.canCastle("KQkq", Black, true))
}

func TestCastleBlackQueenside(t *testing.T) {
	b := emptyBoard()
	place(&b, 7, 4, King, Black)
	place(&b, 7, 0, Rook, Black)
	assert.True(t, b.canCastle("KQkq", Black, false))
}
