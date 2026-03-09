import { Separator } from "@/components/ui/separator"
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
