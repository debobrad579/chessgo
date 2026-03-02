import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useFetch } from "@/hooks/useFetch"
import { formatTimeControl } from "@/lib/formatters"
import type { Result } from "@/types/chess"
import { Timer } from "lucide-react"
import { useNavigate } from "react-router"

type SavedGame = {
  id: string
  white_name: string
  black_name: string
  time_control_base: number
  time_control_increment: number
  result: Result
}

export default function GamesPage() {
  const { data } = useFetch<SavedGame[]>("/games")
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>White</TableHead>
          <TableHead>Black</TableHead>
          <TableHead>
            <Timer />
          </TableHead>
          <TableHead>Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => navigate(`/games/${item.id}`)}
            className="cursor-pointer"
          >
            <TableCell>{item.white_name}</TableCell>
            <TableCell>{item.black_name}</TableCell>
            <TableCell>
              {formatTimeControl({
                base: item.time_control_base,
                increment: item.time_control_increment,
              })}
            </TableCell>
            <TableCell>{item.result}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
