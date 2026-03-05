import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/context/UserContext"
import { Link, Outlet } from "react-router"

export default function Layout() {
  const { user } = useUser()

  return (
    <div className="flex flex-col">
      <nav className="flex justify-between items-center p-4">
        <Link to="/">
          <img
            src="/static/logo.svg"
            alt="Logo"
            className="dark:invert h-12 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          {!user?.email ? (
            <>
              <Button asChild variant="ghost">
                <a href="/login">Login</a>
              </Button>
              <Button asChild variant="ghost">
                <a href="/register">Register</a>
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost">
              <Link to="/games">My Games</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </nav>
      <Separator />
      <main className="p-4 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
