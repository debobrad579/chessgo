export function parseFEN(fen: string) {
  const rows = fen.split(" ")[0].split("/")
  const board = rows.map((row) => {
    const expandedRow: (string | null)[] = []
    for (const character of row) {
      if (isNaN(Number(character))) {
        expandedRow.push(character)
      } else {
        expandedRow.push(...Array(Number(character)).fill(null))
      }
    }
    return expandedRow
  })
  return board
}
