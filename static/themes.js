const selectedTheme = localStorage.getItem("ui-theme") ?? "system"

const prefersDarkMode = window.matchMedia?.(
  "(prefers-color-scheme: dark)",
)?.matches

const shouldUseDark =
  selectedTheme === "dark" || (selectedTheme === "system" && prefersDarkMode)

document.documentElement.classList.toggle("dark", shouldUseDark)
