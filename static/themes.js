const theme = localStorage.getItem("ui-theme")
const prefersDarkMode = window.matchMedia?.(
  "(prefers-color-scheme: dark)",
)?.matches

document.documentElement.classList.toggle(
  "dark",
  theme === "dark" || (theme === "system" && prefersDarkMode),
)
