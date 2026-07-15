// Page d'accueil publique (Server Component, rendu dynamique côté serveur)
// Désactiver le pré-rendu statique car les données viennent de la base de données PostgreSQL
export const dynamic = 'force-dynamic'

import Link from "next/link"
import Image from "next/image"
import prisma, { mapperPrismaVersCarte, mapperPrismaVersHolder } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Shield, QrCode, ArrowRight, Sparkles } from "lucide-react"

export default async function Home() {
  // Charger les cartes et titulaires de démo directement depuis la base PostgreSQL via Prisma
  const cardsPrisma = await prisma.card.findMany({
    orderBy: { createdAt: "desc" }
  })
  
  const holdersPrisma = await prisma.cardHolder.findMany()

  const cards = cardsPrisma.map(mapperPrismaVersCarte)
  const holders = holdersPrisma.map(mapperPrismaVersHolder)

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Gradients de fond décoratifs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-8 z-10">
        
        {/* Titre et sous-titre de présentation */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 bg-secondary/80 border border-border/40 px-4.5 py-1.5 rounded-full text-xs font-semibold text-brand-orange shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>Découvrez le futur du réseautage professionnel</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Baarako <span className="text-brand-orange">Card</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Cartes de contact professionnelles digitales (NFC & QR Code) à gestion B2B/B2C depuis votre Back-Office.
          </p>
        </div>

        {/* Bouton d'accès au dashboard administration */}
        <div className="w-full max-w-xs pt-2">
          <Link href="/admin" className="w-full">
            <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-3 py-4 text-base font-bold shadow-lg shadow-brand-orange/20 active:scale-95 cursor-pointer">
              <span>Tableau de Bord Admin</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <span className="text-[10px] text-muted-foreground/60 block mt-2">
            Rôles d'administration interne & édition des fiches en direct
          </span>
        </div>

        {/* Section de Démonstration (Aperçu des cartes publiques de démo) */}
        <div className="w-full space-y-4 pt-6">
          <h2 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
            Aperçus de Démo (Sélectionnez pour tester)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((card: any) => {
              const holder = holders.find((h: any) => h.id === card.holderId)
              if (!holder) return null
              
              return (
                <Link key={card.id} href={`/${card.slug}`}>
                  <Card className="hover:border-brand-orange/60 hover:scale-103 transition-all duration-300 h-full cursor-pointer flex flex-col justify-between">
                    <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-card bg-secondary shadow-md">
                        <Image 
                          src={holder.avatarUrl} 
                          alt={holder.name} 
                          fill 
                          className="object-cover object-top"
                        />
                      </div>
                      <div>
                        <span className="text-sm font-extrabold block leading-snug truncate max-w-[150px]">
                          {holder.name}
                        </span>
                        <span className="text-[10px] text-brand-green font-semibold mt-0.5 block truncate max-w-[150px]">
                          {holder.title}
                        </span>
                      </div>
                      
                      <div className="text-[9px] font-mono text-muted-foreground/80 pt-1 border-t border-border/20 w-full truncate">
                        slug: /{card.slug}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Liste des bénéfices produit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-8 border-t border-border/20 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center text-brand-orange border border-border/30 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase">100% Back-Office</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Aucun compte ni mot de passe à retenir pour vos collaborateurs.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center text-brand-green border border-border/30 shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase">vCard & NFC</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Enregistrement automatique du contact dans le répertoire en 1 clic.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center text-blue-400 border border-border/30 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase">Gabarit Réaliste</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Aperçu visuel fidèle de la carte physique imprimée NFC.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
