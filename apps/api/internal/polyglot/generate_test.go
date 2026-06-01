package polyglot_test

import (
	"testing"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/polyglot"
	"github.com/stretchr/testify/assert"
)

func TestGenerate(t *testing.T) {
	game := chess.Game{
		State: chess.NewGameState(),
	}
	assert.Equal(t, uint64(0x463b96181691fc9c), polyglot.GetZobristKey(&game.State))

	game.Move(chess.Move{From: "e2", To: "e4"})
	assert.Equal(t, uint64(0x823c9b50fd114196), polyglot.GetZobristKey(&game.State))

	game.Move(chess.Move{From: "d7", To: "d5"})
	assert.Equal(t, uint64(0x0756b94461c50fb0), polyglot.GetZobristKey(&game.State))

	game.Move(chess.Move{From: "e4", To: "e5"})
	assert.Equal(t, uint64(0x662fafb965db29d4), polyglot.GetZobristKey(&game.State))

	game.Move(chess.Move{From: "f7", To: "f5"})
	assert.Equal(t, uint64(0x22a48b5a8e47ff78), polyglot.GetZobristKey(&game.State))

	game.Move(chess.Move{From: "e1", To: "e2"})
	assert.Equal(t, uint64(0x652a607ca3f242c1), polyglot.GetZobristKey(&game.State))

	game.Move(chess.Move{From: "e8", To: "f7"})
	assert.Equal(t, uint64(0x00fdd303c946bdd9), polyglot.GetZobristKey(&game.State))
}
