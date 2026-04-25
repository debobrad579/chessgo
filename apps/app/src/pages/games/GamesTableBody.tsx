import { TableBody, TableCell, TableRow } from "@chessgo/ui/table"
import { useFetch } from "@/hooks/useFetch"
import { formatTimeControl } from "@/lib/formatters"
import { useNavigate } from "react-router"
import { assertGameSummaryList } from "@/types/chess"
import { API_BASE } from "@/lib/api"
import { PAGE_SIZE } from "."

export function GamesTableBody({ pageNumber }: { pageNumber: number }) {
  const { data } = useFetch(
    `${API_BASE}/api/games?page_number=${pageNumber}&page_size=${PAGE_SIZE}`,
    assertGameSummaryList,
  )
  const navigate = useNavigate()

  return (
    <TableBody>
      {data.map((item) => (
        <TableRow
          key={item.id}
          onClick={() => navigate(`/games/${item.id}`)}
          className="cursor-pointer"
        >
          <TableCell>{item.white.name}</TableCell>
          <TableCell>{item.black.name}</TableCell>
          <TableCell>
            {formatTimeControl({
              base: item.time_control.base,
              increment: item.time_control.increment,
            })}
          </TableCell>
          <TableCell>{item.result}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}
