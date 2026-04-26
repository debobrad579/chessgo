import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@chessgo/ui/table"
import { CreateGameButton } from "./CreateGameButton"
import { Timer } from "lucide-react"
import { Skeleton } from "@chessgo/ui/skeleton"

const LOBBY_WIDTHS: [number, number][] = [
  [96, 40],
  [72, 40],
  [112, 32],
  [88, 40],
  [80, 32],
]

const ONGOING_WIDTHS: [number, number, number][] = [
  [96, 88, 40],
  [72, 104, 32],
  [112, 80, 40],
  [88, 96, 32],
  [80, 112, 40],
]

export function HomeSkeleton() {
  return (
    <div className="space-y-4">
      <h2 className="text-center text-3xl font-bold">Lobby</h2>
      <CreateGameButton />
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
          {Array.from({ length: 5 }).map((_, i) => {
            const [player, time] = LOBBY_WIDTHS[i % LOBBY_WIDTHS.length]
            return (
              <TableRow key={i} style={{ opacity: 1 - i * (0.6 / 5) }}>
                <TableCell>
                  <Skeleton
                    className="h-lh rounded-sm"
                    style={{ width: player }}
                  />
                </TableCell>
                <TableCell>
                  <Skeleton
                    className="h-lh rounded-sm"
                    style={{ width: time }}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <h2 className="text-center text-3xl font-bold">Ongoing Games</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>White</TableHead>
            <TableHead>Black</TableHead>
            <TableHead>
              <Timer />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => {
            const [white, black, time] =
              ONGOING_WIDTHS[i % ONGOING_WIDTHS.length]
            return (
              <TableRow key={i} style={{ opacity: 1 - i * (0.6 / 5) }}>
                <TableCell>
                  <Skeleton
                    className="h-lh rounded-sm"
                    style={{ width: white }}
                  />
                </TableCell>
                <TableCell>
                  <Skeleton
                    className="h-lh rounded-sm"
                    style={{ width: black }}
                  />
                </TableCell>
                <TableCell>
                  <Skeleton
                    className="h-lh rounded-sm"
                    style={{ width: time }}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
