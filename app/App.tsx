import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"
import { ThemeToggle } from "@/components/themes/ThemeToggle"
import { ThemeProvider } from "@/context/ThemeContext"
import { UserProvider } from "@/context/UserContext"
import PlayPage from "@/pages/play"

function App() {
  return (
    <UserProvider>
      <BrowserRouter basename="/app">
        <Routes>
          <Route path="/" element={<PlayPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/2" element={<ThemeToggle />} />
          <Route
            path="/3"
            element={
              <div className="text-blue-500 text-4xl font-bold">Page 3</div>
            }
          />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
