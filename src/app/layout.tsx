// En-tête global de l'application (Layout principal)
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { NotificationProvider } from "@/providers/NotificationProvider"
import "./globals.css"

// --------------------------------------------------------------------------
// Importation des polices premium modernes
// --------------------------------------------------------------------------

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// --------------------------------------------------------------------------
// Métadonnées SEO globales
// --------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Baarako Card - Votre carte de visite digitale",
  description: "La carte de visite intelligente avec technologie NFC et QR Code pour l'Afrique.",
}

// --------------------------------------------------------------------------
// Composant de mise en page racine
// --------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Wrap avec ThemeProvider et NotificationProvider */}
        <ThemeProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
