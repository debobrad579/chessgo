package chess

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
}

type Move struct {
	From      string     `json:"from"`
	To        string     `json:"to"`
	Timestamp int        `json:"timestamp"`
	Promotion *PieceType `json:"promotion,omitempty"`
}

type Player struct {
	Name string `json:"name"`
	Elo  int    `json:"elo"`
}

type Game struct {
	State  GameState `json:"state"`
	White  Player    `json:"white"`
	Black  Player    `json:"black"`
	Result string    `json:"result"`
	Moves  []Move    `json:"moves"`
}
