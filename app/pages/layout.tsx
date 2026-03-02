import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link, Outlet } from "react-router"

export default function Layout() {
  return (
    <>
      <nav className="flex justify-between items-center p-4">
        <Link to="/">
          <img
            src="/static/logo.svg"
            alt="Logo"
            className="dark:invert h-12 w-auto"
          />
        </Link>
        <div className="flex gap-2">
          <Button asChild variant="ghost">
            <Link to="/games">My Games</Link>
          </Button>
          <ThemeToggle />
        </div>
      </nav>
      <Separator />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  )
}
