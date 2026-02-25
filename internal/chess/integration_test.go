package chess

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test4KnightsEnglish(t *testing.T) {
	g := newGame()

	moves := []Move{
		{From: "c2", To: "c4"},
		{From: "e7", To: "e5"},
		{From: "b1", To: "c3"},
		{From: "g8", To: "f6"},
		{From: "g1", To: "f3"},
		{From: "b8", To: "c6"},
		{From: "e2", To: "e3"},
		{From: "f8", To: "b4"},
		{From: "d1", To: "c2"},
		{From: "e8", To: "g8"},
		{From: "c3", To: "d5"},
		{From: "f8", To: "e8"},
		{From: "c2", To: "f5"},
	}

	for _, m := range moves {
		assert.True(t, g.IsMoveValid(m), "move %s-%s should be valid", m.From, m.To)
		g.Move(m)
	}
}

func TestFoolsMate(t *testing.T) {
	g := newGame()

	moves := []Move{
		{From: "f2", To: "f3"},
		{From: "e7", To: "e5"},
		{From: "g2", To: "g4"},
		{From: "d8", To: "h4"},
	}

	for _, m := range moves {
		require.True(t, g.IsMoveValid(m), "move %s-%s should be valid", m.From, m.To)
		g.Move(m)
	}

	assert.True(t, g.State.Board.inCheck(White))
}
