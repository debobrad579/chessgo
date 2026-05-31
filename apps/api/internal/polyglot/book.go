package polyglot

import (
	"encoding/binary"
	"math/rand/v2"
	"os"
	"slices"

	"github.com/debobrad579/chessgo/internal/chess"
)

var bookData [][]byte

func InitializeBookData(filename string) {
	data, err := os.ReadFile(os.Getenv("POLYGLOT_BOOK_FILEPATH"))
	if err == nil {
		bookData = slices.Collect(slices.Chunk(data, 16))
	}
}

func GetBookMove(state *chess.GameState) *chess.Move {
	if bookData == nil {
		return nil
	}

	hash := GetZobristKey(state)

	first, last := findFirst(bookData, hash), findLast(bookData, hash)
	if first < 0 || last < 0 || last-first < 0 {
		return nil
	}

	move := selectRandomMove(bookData[first : last+1])

	moveData := binary.BigEndian.Uint16(move[8:10])
	if moveData == 0 {
		return nil
	}

	toFile := moveData & 0b111
	toRank := (moveData >> 3) & 0b111
	fromFile := (moveData >> 6) & 0b111
	fromRank := (moveData >> 9) & 0b111
	promotion := (moveData >> 12) & 0b111

	var promotionPiece chess.PieceType
	switch promotion {
	case 1:
		promotionPiece = chess.Knight
	case 2:
		promotionPiece = chess.Bishop
	case 3:
		promotionPiece = chess.Rook
	case 4:
		promotionPiece = chess.Queen
	}

	from := string(rune('a'+fromFile)) + string(rune('1'+fromRank))
	to := string(rune('a'+toFile)) + string(rune('1'+toRank))
	piece := state.Board[fromRank][fromFile]

	if piece != nil && piece.Type == chess.King {
		switch from {
		case "e1":
			switch to {
			case "h1":
				to = "g1"
			case "a1":
				to = "c1"
			}
		case "e8":
			switch to {
			case "h8":
				to = "g8"
			case "a8":
				to = "c8"
			}
		}
	}

	return &chess.Move{
		From:      from,
		To:        to,
		Promotion: promotionPiece,
	}
}

func selectRandomMove(moves [][]byte) []byte {
	var total uint16

	for _, move := range moves {
		total += binary.BigEndian.Uint16(move[10:12])
	}

	if total == 0 {
		return nil
	}

	random := rand.IntN(int(total))

	var cumulative uint16
	for _, move := range moves {
		cumulative += binary.BigEndian.Uint16(move[10:12])

		if random < int(cumulative) {
			return move
		}
	}

	return nil
}

func findFirst(data [][]byte, targetHash uint64) int {
	lo, hi := 0, len(data)-1
	first := -1

	for lo <= hi {
		mid := lo + (hi-lo)/2

		hash := binary.BigEndian.Uint64(data[mid])

		if hash == targetHash {
			first = mid
			hi = mid - 1
		}

		if hash > targetHash {
			hi = mid - 1
		} else {
			lo = mid + 1
		}
	}

	return first
}

func findLast(data [][]byte, targetHash uint64) int {
	lo, hi := 0, len(data)-1
	last := -1

	for lo <= hi {
		mid := lo + (hi-lo)/2

		hash := binary.BigEndian.Uint64(data[mid])

		if hash == targetHash {
			last = mid
			lo = mid + 1
		}

		if hash > targetHash {
			hi = mid - 1
		} else {
			lo = mid + 1
		}
	}

	return last
}
