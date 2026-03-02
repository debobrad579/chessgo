package chess

func (gs GameState) getHashedPosition() string {
	var buf [72]byte
	idx := 0
	for row := range 8 {
		for col := range 8 {
			p := gs.Board[row][col]
			if p == nil {
				buf[idx] = '.'
			} else {
				buf[idx] = byte(p.Type)
				if p.Color == White {
					buf[idx] ^= 0x20
				}
			}
			idx++
		}
	}

	return string(buf[:64]) + string(gs.ActiveColor) + gs.CastlingRights + gs.EnPassantTarget
}
