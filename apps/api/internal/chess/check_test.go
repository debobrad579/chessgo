package chess

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNotInCheck(t *testing.T) {
	b := emptyBoard()
	place(&b, 0, 4, King, White)
	assert.False(t, b.inCheck(White))
}

func TestCheckByRook(t *testing.T) {
	b := emptyBoard()
	place(&b, 0, 4, King, White)
	place(&b, 0, 7, Rook, Black)
	assert.True(t, b.inCheck(White))
}

func TestCheckByBishop(t *testing.T) {
	b := emptyBoard()
	place(&b, 0, 0, King, White)
	place(&b, 7, 7, Bishop, Black)
	assert.True(t, b.inCheck(White))
}

func TestCheckByKnight(t *testing.T) {
	b := emptyBoard()
	place(&b, 4, 4, King, White)
	place(&b, 6, 5, Knight, Black)
	assert.True(t, b.inCheck(White))
}

func TestCheckByPawn(t *testing.T) {
	b := emptyBoard()
	place(&b, 4, 4, King, White)
	place(&b, 5, 5, Pawn, Black)
	assert.True(t, b.inCheck(White))
}

func TestCheckBlockedByPiece(t *testing.T) {
	b := emptyBoard()
	place(&b, 0, 4, King, White)
	place(&b, 0, 6, Pawn, White)
	place(&b, 0, 7, Rook, Black)
	assert.False(t, b.inCheck(White))
}
