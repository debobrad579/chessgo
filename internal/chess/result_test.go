package chess

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestResultAtStart(t *testing.T) {
	g := newGame()
	result := g.Result()
	assert.Equal(t, GameOngoing, result.Reason)
	assert.Equal(t, ResultGameOngoing, result.Result)
}

func TestResultFoolsMate(t *testing.T) {
	g := newGame()
	moves := []Move{
		{From: "f2", To: "f3"}, {From: "e7", To: "e5"},
		{From: "g2", To: "g4"}, {From: "d8", To: "h4"},
	}
	for _, move := range moves {
		require.True(t, g.IsMoveValid(move))
		g.Move(move)
	}
	result := g.Result()
	assert.Equal(t, Checkmate, result.Reason)
	assert.Equal(t, ResultBlackWon, result.Result)
}

func TestResultStalemate(t *testing.T) {
	var b Board
	place(&b, 7, 0, King, Black)
	place(&b, 5, 1, Queen, White)
	place(&b, 5, 2, King, White)

	g := &Game{State: GameState{Board: b, ActiveColor: Black, CastlingRights: ""}}

	result := g.Result()
	assert.Equal(t, Stalemate, result.Reason)
	assert.Equal(t, ResultDraw, result.Result)
}

func TestResultFiftyMoveRule(t *testing.T) {
	var b Board
	place(&b, 0, 0, King, White)
	place(&b, 7, 7, King, Black)
	place(&b, 3, 3, Pawn, White)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	shuttle := []Move{
		{From: "a1", To: "b1"},
		{From: "h8", To: "g8"},
		{From: "b1", To: "a1"},
		{From: "g8", To: "h8"},
	}
	for i := 0; i < 25; i++ {
		for _, move := range shuttle {
			g.Move(move)
		}
	}

	result := g.Result()
	assert.Equal(t, FiftyMoveRule, result.Reason)
	assert.Equal(t, ResultDraw, result.Result)
}

func TestResultFiftyMoveRulePawnMoved(t *testing.T) {
	var b Board
	place(&b, 0, 0, King, White)
	place(&b, 7, 7, King, Black)
	place(&b, 3, 3, Pawn, White)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	shuttle := []Move{
		{From: "a1", To: "b1"},
		{From: "h8", To: "g8"},
		{From: "b1", To: "a1"},
		{From: "g8", To: "h8"},
	}

	for i := 0; i < 24; i++ {
		for _, move := range shuttle {
			g.Move(move)
		}
	}

	g.Move(Move{From: "d4", To: "d5"})

	for i := 0; i < 24; i++ {
		for _, move := range shuttle {
			g.Move(move)
		}
	}

	result := g.Result()
	assert.NotEqual(t, FiftyMoveRule, result.Reason)
}

func TestResultFiftyMoveRuleCapture(t *testing.T) {
	var b Board
	place(&b, 0, 0, King, White)
	place(&b, 7, 7, King, Black)
	place(&b, 6, 7, Pawn, White)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	shuttle := []Move{
		{From: "a1", To: "b1"},
		{From: "h8", To: "h7"},
		{From: "b1", To: "a1"},
		{From: "h7", To: "h8"},
	}

	for i := 0; i < 25; i++ {
		for _, move := range shuttle {
			g.Move(move)
		}
	}

	result := g.Result()
	assert.NotEqual(t, FiftyMoveRule, result.Reason)
}

func TestResultThreefoldRepetition(t *testing.T) {
	var b Board
	place(&b, 4, 4, Pawn, White)
	place(&b, 0, 0, King, White)
	place(&b, 7, 7, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	moves := []Move{
		{From: "a1", To: "b1"}, {From: "h8", To: "g8"},
		{From: "b1", To: "a1"}, {From: "g8", To: "h8"},
		{From: "a1", To: "b1"}, {From: "h8", To: "g8"},
	}
	for i := 0; i < 2; i++ {
		for _, move := range moves {
			g.Move(move)
		}
	}

	result := g.Result()
	assert.Equal(t, ThreefoldRepetition, result.Reason)
	assert.Equal(t, ResultDraw, result.Result)
}

func TestResultInsufficientKvK(t *testing.T) {
	var b Board
	place(&b, 0, 0, King, White)
	place(&b, 7, 7, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	result := g.Result()
	assert.Equal(t, InsufficentMaterial, result.Reason)
	assert.Equal(t, ResultDraw, result.Result)
}

func TestResultInsufficientKBvK(t *testing.T) {
	var b Board
	place(&b, 0, 0, King, White)
	place(&b, 0, 1, Bishop, White)
	place(&b, 7, 7, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	result := g.Result()
	assert.Equal(t, InsufficentMaterial, result.Reason)
	assert.Equal(t, ResultDraw, result.Result)
}

func TestResultInsufficientKNvK(t *testing.T) {
	var b Board
	place(&b, 0, 0, King, White)
	place(&b, 0, 1, Knight, White)
	place(&b, 7, 7, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	result := g.Result()
	assert.Equal(t, InsufficentMaterial, result.Reason)
	assert.Equal(t, ResultDraw, result.Result)
}

func TestResultInsufficientKBvKBSameColor(t *testing.T) {
	var b Board
	place(&b, 0, 0, King, White)
	place(&b, 0, 2, Bishop, White)
	place(&b, 7, 7, King, Black)
	place(&b, 6, 6, Bishop, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	result := g.Result()
	assert.Equal(t, InsufficentMaterial, result.Reason)
	assert.Equal(t, ResultDraw, result.Result)
}

func TestResultSufficientKBvKBDifferentColor(t *testing.T) {
	var b Board
	place(&b, 0, 0, King, White)
	place(&b, 0, 2, Bishop, White)
	place(&b, 7, 7, King, Black)
	place(&b, 6, 7, Bishop, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	result := g.Result()
	assert.Equal(t, GameOngoing, result.Reason)
	assert.Equal(t, ResultGameOngoing, result.Result)
}

func TestResultSufficientWithQueen(t *testing.T) {
	var b Board
	place(&b, 0, 0, King, White)
	place(&b, 0, 4, Queen, White)
	place(&b, 7, 7, King, Black)

	g := &Game{State: GameState{Board: b, ActiveColor: White, CastlingRights: ""}}

	result := g.Result()
	assert.Equal(t, GameOngoing, result.Reason)
	assert.Equal(t, ResultGameOngoing, result.Result)
}
