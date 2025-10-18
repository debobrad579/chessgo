export function Arrow({
  squareWidth,
  arrow,
}: {
  squareWidth: number
  arrow: { startIndex: number; endIndex: number }
}) {
  function indexToCoords(index: number) {
    const x = (index % 8) * squareWidth + squareWidth / 2
    const y = Math.floor(index / 8) * squareWidth + squareWidth / 2
    return { x, y }
  }

  const strokeWidth = squareWidth / 8
  const arrowSize = strokeWidth * 4
  const arrowOffset = arrowSize * 0.26
  const start = indexToCoords(arrow.startIndex)
  const end = indexToCoords(arrow.endIndex)
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)
  const adjustedEndX = end.x - arrowOffset * Math.cos(angle)
  const adjustedEndY = end.y - arrowOffset * Math.sin(angle)

  return (
    <g opacity="0.8">
      <line
        x1={start.x + (dx / length) * (squareWidth / 6)}
        y1={start.y + (dy / length) * (squareWidth / 6)}
        x2={adjustedEndX - arrowSize * Math.cos(angle)}
        y2={adjustedEndY - arrowSize * Math.sin(angle)}
        strokeLinecap="square"
        stroke="#ffaa00"
        strokeWidth={strokeWidth}
      />
      <polygon
        points={`${adjustedEndX},${adjustedEndY}
              ${adjustedEndX - arrowSize * Math.cos(angle - Math.PI / 6)},
              ${adjustedEndY - arrowSize * Math.sin(angle - Math.PI / 6)} 
              ${adjustedEndX - arrowSize * Math.cos(angle + Math.PI / 6)},
              ${adjustedEndY - arrowSize * Math.sin(angle + Math.PI / 6)}`}
        fill="#ffaa00"
        stroke="#ffaa00"
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
      />
    </g>
  )
}
