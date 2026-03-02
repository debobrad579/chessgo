package chess_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/debobrad579/chessgo/internal/chess"
)

func TestFourKnightsEnglish(t *testing.T) {
	game := &chess.Game{State: chess.NewGameState()}

	moves := []chess.Move{
		{From: "c2", To: "c4"}, {From: "e7", To: "e5"},
		{From: "b1", To: "c3"}, {From: "g8", To: "f6"},
		{From: "g1", To: "f3"}, {From: "b8", To: "c6"},
		{From: "e2", To: "e3"}, {From: "f8", To: "b4"},
		{From: "d1", To: "c2"}, {From: "e8", To: "g8"},
		{From: "c3", To: "d5"}, {From: "f8", To: "e8"},
		{From: "c2", To: "f5"}, {From: "d7", To: "d6"},
		{From: "d5", To: "f6"}, {From: "g7", To: "f6"},
		{From: "f5", To: "h5"}, {From: "e5", To: "e4"},
		{From: "h1", To: "g1"}, {From: "e4", To: "f3"},
		{From: "g2", To: "f3"}, {From: "g8", To: "h8"},
		{From: "a2", To: "a3"}, {From: "b4", To: "c5"},
		{From: "h5", To: "h6"}, {From: "e8", To: "g8"},
		{From: "g1", To: "g8"}, {From: "h8", To: "g8"},
		{From: "f1", To: "d3"}, {From: "f6", To: "f5"},
		{From: "b2", To: "b4"}, {From: "c6", To: "e5"},
		{From: "c1", To: "b2"}, {From: "e5", To: "d3"},
		{From: "e1", To: "e2"}, {From: "d3", To: "b2"},
		{From: "a1", To: "g1"}, {From: "g8", To: "h8"},
		{From: "h6", To: "g7"},
	}

	for _, move := range moves {
		require.True(t, game.IsMoveValid(move), "move %s-%s should be valid", move.From, move.To)
		game.Move(move)
	}

	result := game.Result()
	assert.Equal(t, chess.Checkmate, result.Reason)
	assert.Equal(t, chess.ResultWhiteWon, result.Result)
}

func TestBerlinDraw(t *testing.T) {
	game := &chess.Game{State: chess.NewGameState()}

	moves := []chess.Move{
		{From: "e2", To: "e4"}, {From: "e7", To: "e5"},
		{From: "g1", To: "f3"}, {From: "b8", To: "c6"},
		{From: "f1", To: "b5"}, {From: "g8", To: "f6"},
		{From: "e1", To: "g1"}, {From: "f6", To: "e4"},
		{From: "d2", To: "d4"}, {From: "e4", To: "d6"},
		{From: "d4", To: "e5"}, {From: "d6", To: "b5"},
		{From: "a2", To: "a4"}, {From: "b5", To: "d4"},
		{From: "f3", To: "d4"}, {From: "c6", To: "d4"},
		{From: "d1", To: "d4"}, {From: "d7", To: "d5"},
		{From: "e5", To: "d6"}, {From: "d8", To: "d6"},
		{From: "d4", To: "e4"}, {From: "d6", To: "e6"},
		{From: "e4", To: "d4"}, {From: "e6", To: "d6"},
		{From: "d4", To: "e4"}, {From: "d6", To: "e6"},
		{From: "e4", To: "d4"}, {From: "e6", To: "d6"},
	}

	for _, move := range moves {
		require.True(t, game.IsMoveValid(move), "move %s-%s should be valid", move.From, move.To)
		game.Move(move)
	}

	result := game.Result()
	assert.Equal(t, chess.ThreefoldRepetition, result.Reason)
	assert.Equal(t, chess.ResultDraw, result.Result)
}
