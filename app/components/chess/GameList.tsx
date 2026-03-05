import { GameListItem } from "@/types/chess"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEventSource } from "@/hooks/useEventSource"
import { formatTimeControl } from "@/lib/formatters"
import { useNavigate } from "react-router"
import { Timer } from "lucide-react"
import { playerExists } from "./game/utils"

export function GameList() {
  const { data } = useEventSource<GameListItem[]>("/api/live")
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>
            <Timer />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => navigate(`/live/${item.id}`)}
            className="cursor-pointer"
          >
            <TableCell>
              {playerExists(item.white) ? item.white.name : item.black.name}
            </TableCell>
            <TableCell>{formatTimeControl(item.time_control)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
