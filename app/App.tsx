import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"
import { ThemeProvider } from "@/context/ThemeContext"
import { UserProvider } from "@/context/UserContext"
import Layout from "@/pages/layout"
import HomePage from "@/pages"
import LivePage from "@/pages/live"
import GamesPage from "@/pages/games"
import GamePage from "@/pages/game"

function App() {
  return (
    <UserProvider>
      <BrowserRouter basename="/app">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/live/:gameID" element={<LivePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/:gameID" element={<GamePage />} />
          </Route>
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
