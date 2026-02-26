import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"
import { ThemeProvider } from "@/context/ThemeContext"
import { UserProvider } from "@/context/UserContext"
import HomePage from "@/pages"
import LivePage from "@/pages/live"

function App() {
  return (
    <UserProvider>
      <BrowserRouter basename="/app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/live/:gameID" element={<LivePage />} />
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
