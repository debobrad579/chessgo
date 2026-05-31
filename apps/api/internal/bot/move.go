package bot

import (
	"bufio"
	"errors"
	"fmt"
	"net"
	"os"
	"strings"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/polyglot"
	"github.com/google/uuid"
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

func MakeMove(userID uuid.UUID, move chess.Move) error {
	room, ok := getRoom(userID)
	if !ok {
		return errors.New("room does not exist")
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	if room.result.Result != chess.ResultGameOngoing {
		return errors.New("game ended")
	}

	if room.getUserColor(userID) != room.game.Turn() {
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

	engineMove, err := room.getEngineMove(&room.game.State)
	if err != nil {
		return err
	}

	room.game.Move(*engineMove)
	room.result = room.game.GetResult()

	return room.sendGameData()
}

func (room *gameRoom) getEngineMove(state *chess.GameState) (*chess.Move, error) {
	bookMove := polyglot.GetBookMove(state)
	if bookMove != nil {
		return bookMove, nil
	}

	conn, err := net.Dial("tcp", os.Getenv("ENGINE_HOST"))
	if err != nil {
		return nil, err
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
		return nil, err
	}

	parts := strings.Split(strings.TrimRight(message, "\n"), " ")
	if len(parts) != 2 {
		return nil, errors.New("unexpected engine response")
	}

	engineMove, err := parseMove(parts[1])
	if err != nil {
		return nil, errors.New("unexpected engine response")
	}

	return engineMove, nil
}
