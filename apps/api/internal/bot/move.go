package bot

import (
	"bufio"
	"errors"
	"fmt"
	"net"
	"os"
	"strings"

	"github.com/debobrad579/chessgo/internal/chess"
)

func parseMove(moveStr string) (*chess.Move, error) {
	if len(moveStr) == 4 {
		return &chess.Move{From: moveStr[:2], To: moveStr[2:]}, nil
	} else if len(moveStr) == 5 {
		return &chess.Move{From: moveStr[:2], To: moveStr[2:4], Promotion: chess.PieceType(moveStr[4])}, nil
	}

	return nil, errors.New("invalid move")
}

func formatMove(move chess.Move) string {
	if move.Promotion == "" {
		return move.From + move.To
	}

	return move.From + move.To + string(move.Promotion)
}

func (room *GameRoom) MakeMove(move chess.Move, color chess.Color) error {
	if room.result.Result != chess.ResultGameOngoing {
		return errors.New("game ended")
	}

	if room.playerColor != room.game.Turn() {
		return errors.New("not your turn")
	}

	if !room.game.IsMoveValid(move) {
		return errors.New("invalid move")
	}

	room.game.Move(move)
	room.result = room.game.GetResult()
	if room.result.Result != chess.ResultGameOngoing {
		room.sendGameData()
		return nil
	}

	conn, err := net.Dial("tcp", os.Getenv("ENGINE_HOST"))
	if err != nil {
		return err
	}
	defer conn.Close()

	var positionCmd strings.Builder
	positionCmd.WriteString("position startpos")
	if len(room.game.Moves) > 0 {
		positionCmd.WriteString(" moves")
	}
	for _, move := range room.game.Moves {
		positionCmd.WriteString(" " + formatMove(move))
	}

	fmt.Fprintf(conn, "%s\n", positionCmd.String())
	fmt.Fprintf(conn, "go depth 7\n")

	message, err := bufio.NewReader(conn).ReadString('\n')
	if err != nil {
		return err
	}

	parts := strings.Split(strings.TrimRight(message, "\n"), " ")
	if len(parts) != 2 {
		return errors.New("unexpected engine response")
	}

	engineMove, err := parseMove(parts[1])
	if err != nil {
		return errors.New("unexpected engine response")
	}

	room.game.Move(*engineMove)
	room.result = room.game.GetResult()

	room.sendGameData()
	return nil
}
