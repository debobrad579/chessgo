import { Component, ReactNode } from "react"

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { error: Error | null }
> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <h1 className="text-4xl font-bold text-center">
            Something went wrong.
          </h1>
        )
      )
    }
    return this.props.children
  }
}
