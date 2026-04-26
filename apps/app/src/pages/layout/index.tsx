import { Separator } from "@chessgo/ui/separator"
import { Outlet } from "react-router"
import { Suspense } from "react"
import { InternalServerError } from "@/components/errors/InternalServerError"
import { ErrorBoundary } from "@/components/errors/ErrorBoundary"
import { Navbar } from "./Navbar"

export default function Layout() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <Separator />
      <main className="flex-1 p-4">
        <ErrorBoundary fallback={<InternalServerError />}>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
