import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/context/UserContext"
import { Link, Outlet } from "react-router"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Suspense } from "react"

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
        <ErrorBoundary
          fallback={
            <h1 className="text-4xl font-bold text-center">
              500 - Internal Server Error
            </h1>
          }
        >
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
