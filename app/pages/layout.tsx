import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/context/UserContext"
import { Link, Outlet } from "react-router"
import { Suspense } from "react"
import { InternalServerError } from "@/components/errors/InternalServerError"
import { ErrorBoundary } from "@/components/errors/ErrorBoundary"

function NavLinks() {
  const user = useUser()

  return !user.email ? (
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
  )
}

export default function Layout() {
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
          <Suspense fallback={null}>
            <NavLinks />
          </Suspense>
          <ThemeToggle />
        </div>
      </nav>
      <Separator />
      <main className="p-4 flex-1">
        <ErrorBoundary fallback={<InternalServerError />}>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
