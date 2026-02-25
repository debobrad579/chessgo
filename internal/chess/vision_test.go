package chess

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPathIsClear(t *testing.T) {
	b := emptyBoard()
	place(&b, 0, 0, Rook, White)

	assert.True(t, b.pathIsClear(0, 0, 0, 7))

	place(&b, 0, 3, Pawn, Black)
	assert.False(t, b.pathIsClear(0, 0, 0, 7))
}

func TestCanSeePawn(t *testing.T) {
	b := emptyBoard()
	wp := &Piece{Pawn, White}
	bp := &Piece{Pawn, Black}

	assert.True(t, b.canSee(1, 3, 2, 2, wp))
	assert.True(t, b.canSee(1, 3, 2, 4, wp))
	assert.False(t, b.canSee(1, 3, 2, 3, wp))
	assert.False(t, b.canSee(1, 3, 0, 2, wp))

	assert.True(t, b.canSee(6, 3, 5, 2, bp))
	assert.True(t, b.canSee(6, 3, 5, 4, bp))
	assert.False(t, b.canSee(6, 3, 7, 2, bp))
}

func TestCanSeeKnight(t *testing.T) {
	b := emptyBoard()
	n := &Piece{Knight, White}

	assert.True(t, b.canSee(3, 3, 5, 4, n))
	assert.True(t, b.canSee(3, 3, 1, 2, n))
	assert.False(t, b.canSee(3, 3, 4, 4, n))
}

func TestCanSeeBishop(t *testing.T) {
	b := emptyBoard()
	bi := &Piece{Bishop, White}

	assert.True(t, b.canSee(0, 0, 7, 7, bi))

	place(&b, 3, 3, Pawn, Black)
	assert.False(t, b.canSee(0, 0, 7, 7, bi))

	assert.False(t, b.canSee(0, 0, 0, 5, bi))
}

func TestCanSeeRook(t *testing.T) {
	b := emptyBoard()
	r := &Piece{Rook, White}

	assert.True(t, b.canSee(0, 0, 0, 7, r))
	assert.True(t, b.canSee(0, 0, 7, 0, r))
	assert.False(t, b.canSee(0, 0, 7, 7, r))

	place(&b, 0, 4, Pawn, Black)
	assert.False(t, b.canSee(0, 0, 0, 7, r))
}

func TestCanSeeQueen(t *testing.T) {
	b := emptyBoard()
	q := &Piece{Queen, White}

	assert.True(t, b.canSee(3, 3, 7, 7, q))
	assert.True(t, b.canSee(3, 3, 3, 0, q))
	assert.True(t, b.canSee(3, 3, 0, 3, q))
	assert.False(t, b.canSee(3, 3, 5, 6, q))
}

func TestCanSeeKing(t *testing.T) {
	b := emptyBoard()
	k := &Piece{King, White}

	assert.True(t, b.canSee(4, 4, 5, 5, k))
	assert.True(t, b.canSee(4, 4, 4, 5, k))
	assert.False(t, b.canSee(4, 4, 6, 6, k))
}
