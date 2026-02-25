package chess

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPseudoLegalNilSquare(t *testing.T) {
	b := emptyBoard()
	moves := b.pseudoLegalPieceMoves(3, 3)
	assert.Nil(t, moves)
}

func TestPseudoLegalWhitePawnOpening(t *testing.T) {
	b := emptyBoard()
	place(&b, 1, 4, Pawn, White)
	moves := b.pseudoLegalPieceMoves(1, 4)
	assert.Len(t, moves, 2)
}

func TestPseudoLegalWhitePawnBlocked(t *testing.T) {
	b := emptyBoard()
	place(&b, 1, 4, Pawn, White)
	place(&b, 2, 4, Pawn, Black)
	moves := b.pseudoLegalPieceMoves(1, 4)
	assert.Len(t, moves, 0)
}

func TestPseudoLegalWhitePawnCapture(t *testing.T) {
	b := emptyBoard()
	place(&b, 3, 4, Pawn, White)
	place(&b, 4, 3, Pawn, Black)
	place(&b, 4, 5, Pawn, Black)
	moves := b.pseudoLegalPieceMoves(3, 4)
	assert.Len(t, moves, 3)
}

func TestPseudoLegalBlackPawnCapture(t *testing.T) {
	b := emptyBoard()
	place(&b, 4, 4, Pawn, Black)
	place(&b, 3, 3, Pawn, White)
	place(&b, 3, 5, Pawn, White)
	moves := b.pseudoLegalPieceMoves(4, 4)
	assert.Len(t, moves, 3)
}

func TestPseudoLegalPawnCannotCaptureFriendly(t *testing.T) {
	b := emptyBoard()
	place(&b, 3, 4, Pawn, White)
	place(&b, 4, 3, Pawn, White)
	place(&b, 4, 5, Pawn, White)
	moves := b.pseudoLegalPieceMoves(3, 4)
	assert.Len(t, moves, 1)
}

func TestPseudoLegalKnight(t *testing.T) {
	b := emptyBoard()
	place(&b, 4, 4, Knight, White)
	moves := b.pseudoLegalPieceMoves(4, 4)
	assert.Len(t, moves, 8)
}

func TestPseudoLegalKnightCorner(t *testing.T) {
	b := emptyBoard()
	place(&b, 0, 0, Knight, White)
	moves := b.pseudoLegalPieceMoves(0, 0)
	assert.Len(t, moves, 2)
}

func TestPseudoLegalBishopCenter(t *testing.T) {
	b := emptyBoard()
	place(&b, 4, 4, Bishop, White)
	moves := b.pseudoLegalPieceMoves(4, 4)
	assert.Len(t, moves, 13)
}

func TestPseudoLegalRookCenter(t *testing.T) {
	b := emptyBoard()
	place(&b, 4, 4, Rook, White)
	moves := b.pseudoLegalPieceMoves(4, 4)
	assert.Len(t, moves, 14)
}

func TestPseudoLegalQueenCenter(t *testing.T) {
	b := emptyBoard()
	place(&b, 4, 4, Queen, White)
	moves := b.pseudoLegalPieceMoves(4, 4)
	assert.Len(t, moves, 27)
}

func TestPseudoLegalKingCenter(t *testing.T) {
	b := emptyBoard()
	place(&b, 4, 4, King, White)
	moves := b.pseudoLegalPieceMoves(4, 4)
	assert.Len(t, moves, 8)
}
