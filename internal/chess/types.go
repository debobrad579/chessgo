package chess

import (
	"github.com/google/uuid"
)

type Color byte

const (
	White Color = 'w'
	Black Color = 'b'
)

type PieceType byte

const (
	Pawn   PieceType = 'p'
	Knight PieceType = 'n'
	Bishop PieceType = 'b'
	Rook   PieceType = 'r'
	Queen  PieceType = 'q'
	King   PieceType = 'k'
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

type Move struct {
	From      string     `json:"from"`
	To        string     `json:"to"`
	Promotion *PieceType `json:"promotion,omitempty"`
	Timestamp int        `json:"timestamp"`
}

type TimeControl struct {
	Base      int `json:"base"`
	Increment int `json:"increment"`
}

type Player struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type Reason int

const (
	Checkmate Reason = iota
	Resignation
	Timeout
	Stalemate
	ThreefoldRepetition
	FiftyMoveRule
	InsufficentMaterial
	GameOngoing
)

type Result string

const (
	ResultWhiteWon    Result = "1-0"
	ResultBlackWon    Result = "0-1"
	ResultDraw        Result = "1/2-1/2"
	ResultGameOngoing Result = "*"
)

type GameOver struct {
	Result Result
	Reason Reason
}

type Game struct {
	State          GameState      `json:"state"`
	White          Player         `json:"white"`
	Black          Player         `json:"black"`
	Moves          []Move         `json:"moves"`
	TimeControl    TimeControl    `json:"time_control"`
	PositionCounts map[string]int `json:"-"`
}
