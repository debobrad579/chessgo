import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useFetch } from "@/hooks/useFetch"
import { formatTimeControl } from "@/lib/formatters"
import { useNavigate } from "react-router"
import type { Game } from "@/types/chess"
import { LIMIT } from "."

export function GamesTableBody({ page }: { page: number }) {
  const { data } = useFetch<Game[]>(`/api/games?page=${page}&limit=${LIMIT}`)
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
