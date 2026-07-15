// Fournisseur du thème clair/sombre pour toute l'application
// Gère la persistance de la préférence utilisateur dans le localStorage
"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

type Theme = "clair" | "sombre"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

// --------------------------------------------------------------------------
// Contexte
// --------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextType>({
  theme: "sombre",
  toggleTheme: () => {},
})

// --------------------------------------------------------------------------
// Fournisseur
// --------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialisation avec la préférence sauvegardée ou le mode sombre par défaut
  const [theme, setTheme] = useState<Theme>("sombre")

  useEffect(() => {
    // Lire la préférence depuis le localStorage au premier rendu
    const preference = localStorage.getItem("baarako-theme") as Theme | null
    if (preference) {
      setTheme(preference)
    }
  }, [])

  useEffect(() => {
    // Appliquer la classe CSS sur l'élément <html> à chaque changement de thème
    const root = document.documentElement
    if (theme === "sombre") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }
    // Sauvegarder la préférence pour les prochaines visites
    localStorage.setItem("baarako-theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === "sombre" ? "clair" : "sombre"))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// --------------------------------------------------------------------------
// Hook d'accès au contexte du thème
// --------------------------------------------------------------------------

export function useTheme() {
  return useContext(ThemeContext)
}
