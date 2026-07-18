import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@chessgo/ui/table"
import { NewGameButton } from "./NewGameButton"
import { Timer } from "lucide-react"
import { useEventSource } from "@/hooks/useEventSource"
import { useNavigate } from "react-router"
import { playerExists } from "@/components/chess/game/utils"
import { formatTimeControl } from "@/lib/formatters"
import { useUser } from "@/context/UserContext"
import { HomeSkeleton } from "./HomeSkeleton"
import { assertGameList } from "@/types/chess"
import { API_BASE } from "@/lib/api"

export default function HomePage() {
  const user = useUser()
  const { data, error } = useEventSource(`${API_BASE}/live`, assertGameList)
  const navigate = useNavigate()

  const lobbyGames = data?.filter(
    (item) => !playerExists(item.white) || !playerExists(item.black),
  )

  const ongoingGames = data
    ?.filter((item) => playerExists(item.white) && playerExists(item.black))
    .sort((a, b) => {
      const aIsPlayer = a.white.id === user.id || a.black.id === user.id
      const bIsPlayer = b.white.id === user.id || b.black.id === user.id
      return Number(bIsPlayer) - Number(aIsPlayer)
    })

  return (
    <>
      {error && (
        <p className="pb-2 text-center text-sm text-muted-foreground">
          {error.message}
        </p>
      )}
      {data == null ? (
        <HomeSkeleton />
      ) : (
        <div className="space-y-4">
          <h2 className="text-center text-3xl font-bold">Lobby</h2>
          <NewGameButton />
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
              {!lobbyGames?.length && (
                <TableRow>
                  <TableCell>No games yet</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
              {lobbyGames?.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => navigate(`/live/${item.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    {playerExists(item.white)
                      ? item.white.name
                      : item.black.name}
                  </TableCell>
                  <TableCell>{formatTimeControl(item.time_control)}</TableCell>
                </TableRow>
              ))}
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
              {!ongoingGames?.length && (
                <TableRow>
                  <TableCell>No games yet</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
              {ongoingGames?.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => navigate(`/live/${item.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell>{item.white.name}</TableCell>
                  <TableCell>{item.black.name}</TableCell>
                  <TableCell>{formatTimeControl(item.time_control)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
