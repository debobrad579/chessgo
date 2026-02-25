import { useState } from "react"

export function useArrows(fen: string) {
  const [highlightedSquares, setHighlightedSquares] = useState<
    { index: number; fen: string }[]
  >([])
  const [startArrowIndex, setStartArrowIndex] = useState<number | undefined>()
  const [arrows, setArrows] = useState<
    { startIndex: number; endIndex: number; fen: string }[]
  >([])

  function addHighlightedSquare(i: number) {
    const highlightedIndices = highlightedSquares.map(
      (highlightedSquare) => highlightedSquare.index,
    )

    if (highlightedIndices.includes(i)) {
      return setHighlightedSquares((prevHighlightedSquares) =>
        prevHighlightedSquares.toSpliced(highlightedIndices.indexOf(i), 1),
      )
    }

    setHighlightedSquares((prevRightClickedSquares) => [
      ...prevRightClickedSquares,
      { index: i, fen: fen },
    ])
  }

  function addArrow(i: number) {
    if (startArrowIndex == null) return

    const arrowKeys = arrows.map(
      (arrow) => `${arrow.startIndex}${arrow.endIndex}`,
    )
    const arrowKey = `${startArrowIndex}${i}`

    if (arrowKeys.includes(arrowKey)) {
      return setArrows((prevArrows) =>
        prevArrows.toSpliced(arrowKeys.indexOf(arrowKey), 1),
      )
    }

    setArrows((prevArrows) => [
      ...prevArrows,
      { startIndex: startArrowIndex, endIndex: i, fen: fen },
    ])
  }

  function handleArrowStart(i: number) {
    setStartArrowIndex(i)
  }

  function handleArrowRelease(i: number) {
    if (startArrowIndex === i) addHighlightedSquare(i)
    else addArrow(i)
    setStartArrowIndex(undefined)
  }

  function handleBoardClick() {
    setArrows((prev) => prev.filter((arrow) => arrow.fen !== fen))
    setHighlightedSquares((prev) => prev.filter((sq) => sq.fen !== fen))
  }

  return {
    arrows,
    highlightedSquares,
    handleArrowStart,
    handleArrowRelease,
    handleBoardClick,
  }
}
