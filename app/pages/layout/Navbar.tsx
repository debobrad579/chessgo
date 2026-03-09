import { ThemeToggle, ThemeToggleMobile } from "./ThemeToggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUser } from "@/context/UserContext"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Menu } from "lucide-react"
import { Suspense, useState } from "react"
import { Link } from "react-router"

export function Navbar() {
  const mobile = useMediaQuery("(max-width: 596px)")

  return (
    <nav className="flex justify-between items-center p-4">
      <Link to="/">
        <img
          src="/static/logo.svg"
          alt="Logo"
          className="dark:invert h-12 w-auto"
        />
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
          <Menu size={48} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        {!user.email ? (
          <>
            <DropdownMenuItem asChild>
              <a href="/login">Login</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/register">Register</a>
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
              <div className="px-2 py-1.5 space-y-2">
                <p className="text-sm">Are you sure you want to log out?</p>
                <div className="flex gap-2">
                  <Button
                    className="w-full"
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmLogout(false)}
                  >
                    No
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    size="sm"
                    asChild
                  >
                    <a href="/logout">Yes</a>
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
            <a href="/login">Login</a>
          </Button>
          <Button asChild variant="ghost">
            <a href="/register">Register</a>
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="ghost">
            <Link to="/games">My Games</Link>
          </Button>
          <Popover open={confirmLogout} onOpenChange={setConfirmLogout}>
            <PopoverTrigger>Logout</PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <p>Are you sure you want to log out?</p>
                <div className="flex justify-center gap-2">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => setConfirmLogout(false)}
                  >
                    No
                  </Button>
                  <Button className="w-full" variant="destructive" asChild>
                    <a href="/logout">Yes</a>
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
