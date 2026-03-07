package chess

import (
	"github.com/google/uuid"
)

type Color byte

const (
	White Color = 'w'
	Black Color = 'b'
)

type PieceType string

const (
	Pawn   PieceType = "p"
	Knight PieceType = "n"
	Bishop PieceType = "b"
	Rook   PieceType = "r"
	Queen  PieceType = "q"
	King   PieceType = "k"
)

type Piece struct {
	Type  PieceType `json:"type"`
	Color Color     `json:"color"`
}

type Board [8][8]*Piece

type GameState struct {
	Board           Board  `json:"board"`
	ActiveColor     Color  `json:"active_color"`
	EnPassantTarget string `json:"enpassant_target"`
	CastlingRights  string `json:"castling_rights"`
	HalfMoveCount   int    `json:"half_move_count"`
}

type Reason string

const (
	Checkmate           Reason = "checkmate"
	Resignation         Reason = "resignation"
	Timeout             Reason = "timeout"
	Stalemate           Reason = "stalemate"
	ThreefoldRepetition Reason = "threefold repetition"
	FiftyMoveRule       Reason = "the 50 move rule"
	InsufficentMaterial Reason = "insufficient material"
	Agreement           Reason = "agreement"
	GameOngoing         Reason = "game ongoing"
)

type Result string

const (
	ResultWhiteWon    Result = "1-0"
	ResultBlackWon    Result = "0-1"
	ResultDraw        Result = "1/2-1/2"
	ResultGameOngoing Result = "*"
)

type GameOver struct {
	Result Result `json:"result"`
	Reason Reason `json:"reason"`
}

type Move struct {
	From      string    `json:"from"`
	To        string    `json:"to"`
	Promotion PieceType `json:"promotion"`
	Timestamp int       `json:"timestamp"`
}

type TimeControl struct {
	Base      int `json:"base"`
	Increment int `json:"increment"`
}

type Player struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type Game struct {
	State          GameState      `json:"-"`
	White          Player         `json:"white"`
	Black          Player         `json:"black"`
	Moves          []Move         `json:"moves"`
	TimeControl    TimeControl    `json:"time_control"`
	PositionCounts map[string]int `json:"-"`
}
