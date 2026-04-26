import { ThemeToggle, ThemeToggleMobile } from "./ThemeToggle"
import { Button } from "@chessgo/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@chessgo/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@chessgo/ui/popover"
import { useUser } from "@/context/UserContext"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Menu } from "lucide-react"
import { Suspense, useState } from "react"
import { Link } from "react-router"
import { API_BASE, WWW_BASE } from "@/lib/api"

function handleLogout() {
  fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  })
    .then((data) => data.json())
    .then((res: { success: boolean }) => {
      if (res.success) {
        console.log(res)
        window.location.assign(WWW_BASE)
      }
    })
}

export function Navbar() {
  const mobile = useMediaQuery("(max-width: 596px)")

  return (
    <nav className="flex items-center justify-between p-4">
      <Link to="/">
        <img src="/logo.svg" alt="Logo" className="h-12 w-auto dark:invert" />
      </Link>
      <Suspense fallback={null}>
        {mobile ? <NavbarMobile /> : <NavbarDesktop />}
      </Suspense>
    </nav>
  )
}

export function NavbarMobile() {
  const user = useUser()
  const [confirmLogout, setConfirmLogout] = useState(false)

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setConfirmLogout(false)
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-lg">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        {!user.email ? (
          <>
            <DropdownMenuItem asChild>
              <a href={`${WWW_BASE}/login`}>Login</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`${WWW_BASE}/register`}>Register</a>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/games">My Games</Link>
            </DropdownMenuItem>
            {!confirmLogout ? (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setConfirmLogout(true)
                }}
              >
                Logout
              </DropdownMenuItem>
            ) : (
              <div className="space-y-2 px-2 py-1.5">
                <p className="text-sm">Are you sure you want to log out?</p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="secondary"
                    onClick={() => setConfirmLogout(false)}
                  >
                    No
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    type="submit"
                    onClick={handleLogout}
                  >
                    Yes
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        <ThemeToggleMobile />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function NavbarDesktop() {
  const user = useUser()
  const [confirmLogout, setConfirmLogout] = useState(false)

  return (
    <div className="flex items-center gap-2">
      {!user.email ? (
        <>
          <Button asChild variant="ghost">
            <a href={`${WWW_BASE}/login`}>Login</a>
          </Button>
          <Button asChild variant="ghost">
            <a href={`${WWW_BASE}/register`}>Register</a>
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="ghost">
            <Link to="/games">My Games</Link>
          </Button>
          <Popover open={confirmLogout} onOpenChange={setConfirmLogout}>
            <PopoverTrigger asChild>
              <Button variant="ghost">Logout</Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <p>Are you sure you want to log out?</p>
                <div className="flex justify-center gap-2">
                  <Button
                    className="flex-1"
                    variant="secondary"
                    onClick={() => setConfirmLogout(false)}
                  >
                    No
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    type="submit"
                    onClick={handleLogout}
                  >
                    Yes
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
      <ThemeToggle />
    </div>
  )
}
