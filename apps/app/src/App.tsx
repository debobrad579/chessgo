import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { ThemeProvider } from "@/context/ThemeContext"
import { UserProvider } from "@/context/UserContext"
import { TooltipProvider } from "@chessgo/ui/tooltip"
import Layout from "@/pages/layout"
import HomePage from "@/pages/home"
import LivePage from "@/pages/live"
import BotPage from "@/pages/bot"
import GamesPage from "@/pages/games"
import GamePage from "@/pages/game"
import { NotFound } from "@/components/errors/NotFound"
import "./tailwind.css"

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/live/:gameID" element={<LivePage />} />
          <Route path="/bot" element={<BotPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:gameID" element={<GamePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <UserProvider>
      <ThemeProvider storageKey="ui-theme">
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </ThemeProvider>
    </UserProvider>
  </StrictMode>,
)
