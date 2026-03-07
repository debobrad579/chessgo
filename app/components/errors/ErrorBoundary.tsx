import { Component, ReactNode } from "react"

type Props = {
  children: ReactNode
  fallback?: ReactNode | ((error: Error) => ReactNode)
}

type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    const { fallback, children } = this.props
    const { error } = this.state

    if (error) {
      if (typeof fallback === "function") {
        return fallback(error)
      }

      return (
        fallback ?? (
          <div className="text-center">
            <h1 className="text-4xl font-bold">Something went wrong.</h1>
            <p className="mt-2 text-red-500">{error.message}</p>
          </div>
        )
      )
    }

    return children
  }
}
