// Page de profil public (Server Component Next.js, rendu dynamique côté serveur)
// Désactiver le pré-rendu statique car les données viennent de la base de données PostgreSQL
export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import prisma, { mapperPrismaVersHolder } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Download, 
  Globe, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageSquare,
  AlertCircle
} from "lucide-react"
import { headers } from "next/headers"
import { PublicDocumentsSection } from "@/components/PublicDocumentsSection"

interface ProfilePageProps {
  params: Promise<{ slug: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params

  // 1. Rechercher les informations de la carte liée au slug (Cascade tolérante pour les accents et encodages Unicode)
  let card = await prisma.card.findUnique({
    where: { slug }
  })

  if (!card) {
    try {
      const decodedSlug = decodeURIComponent(slug)
      // Essai avec le slug décodé
      card = await prisma.card.findUnique({
        where: { slug: decodedSlug }
      })
      
      // Essai avec normalisation NFC (Composé, ex: ï en un seul caractère)
      if (!card) {
        card = await prisma.card.findUnique({
          where: { slug: decodedSlug.normalize("NFC") }
        })
      }
      
      // Essai avec normalisation NFD (Décomposé, ex: i + tréma séparés)
      if (!card) {
        card = await prisma.card.findUnique({
          where: { slug: decodedSlug.normalize("NFD") }
        })
      }
    } catch (e) {
      console.error("Erreur lors de la résolution du slug :", e)
    }
  }
  
  // Si la carte n'existe pas, afficher le message d'indisponibilité
  if (!card) {
    return <InactiveProfileMessage reason="non_existent" />
  }

  // Si la carte est configurée comme inactive, bloquer l'accès
  if (card.statut !== "ACTIVE") {
    return <InactiveProfileMessage reason="inactive" />
  }

  // 2. Charger les informations détaillées du titulaire de la carte
  const holder = await prisma.cardHolder.findUnique({
    where: { id: card.holderId },
    include: { organisation: true, service: true }
  })

  // Si le profil n'existe pas ou s'il est suspendu, bloquer l'accès
  if (!holder || holder.statut !== "ACTIF") {
    return <InactiveProfileMessage reason="suspended" />
  }

  // 3. Enregistrer un scan de visite (QR Code par défaut pour le chargement Web)
  try {
    await prisma.cardScan.create({
      data: {
        cardId: card.id,
        methode: "QR_CODE",
        appareil: "Navigateur Web"
      }
    })
  } catch (erreur) {
    console.error("Erreur enregistrement scan :", erreur)
  }

  const org = holder.organisation
  const holderMapped = mapperPrismaVersHolder(holder)

  // Construction dynamique de l'URL du profil pour le QR code
  const headersList = await headers()
  const host = headersList.get("host") || "baarako.card"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const profileUrl = `${protocol}://${host}/${slug}`

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-start items-center px-4 py-8 md:py-16 selection:bg-brand-orange/30">
      <div className="w-full max-w-md flex flex-col space-y-6">
        
        {/* En-tête / Logo de l'organisation */}
        <div className="flex justify-between items-center w-full px-2">
          {org ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 relative rounded-full overflow-hidden border border-border/50 bg-white/10 flex items-center justify-center">
                {org.logoUrl ? (
                  <img 
                    src={org.logoUrl} 
                    alt={org.nom} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">{org.nom.substring(0, 2)}</span>
                )}
              </div>
              <span className="text-sm font-semibold text-foreground/95">{org.nom}</span>
            </div>
          ) : (
            <span className="text-sm font-bold tracking-wider text-brand-orange">BAARAKO JOBCARD</span>
          )}
          
          {/* Indicateur de langues */}
          <div className="text-xs text-muted-foreground/80 bg-secondary px-2.5 py-1 rounded-full border border-border/20">
            FR / BAM
          </div>
        </div>

        {/* En-tête / Profil du titulaire (Épuré et Moderne) */}
        <Card className="border-border/40 shadow-xl overflow-hidden bg-card">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            
            {/* Grand Avatar Rond avec bordure colorée selon la disponibilité */}
            <div className="relative">
              <div className={`relative w-24 h-24 rounded-full overflow-hidden border-4 bg-secondary shadow-lg ${holderMapped.availability === "available" ? "border-brand-green" : "border-destructive"}`}>
                <img
                  src={holderMapped.avatarUrl}
                  alt={holderMapped.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              
              {/* Indicateur de disponibilité (pastille flottante) */}
              <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-card ${holderMapped.availability === "available" ? "bg-brand-green" : "bg-destructive"}`} />
            </div>

            {/* Identité (Nom, Poste, Service, ID) */}
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {holderMapped.name}
              </h1>
              
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-sm font-bold text-brand-orange uppercase tracking-wider">
                  {holderMapped.title}
                </span>
                
                {holder.service && (
                  <span className="text-xs text-brand-green font-semibold bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded-full mt-1">
                    Service : {holder.service.nom}
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span>ID : {holderMapped.id}</span>
                {holder.organisation && (
                  <>
                    <span>•</span>
                    <span>{holder.organisation.nom}</span>
                  </>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Bouton d'action principal orange - Enregistrer le contact */}
        <div className="w-full mt-2">
          <a 
            href={`/api/vcard/${holderMapped.id}`} 
            download
            className="w-full block"
          >
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full flex items-center justify-center gap-3 relative py-3.5 glow-orange active:scale-95 group cursor-pointer"
            >
              <Download className="w-5 h-5 animate-pulse group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-bold uppercase tracking-wider">Enregistrer le contact</span>
                <span className="text-[10px] text-white/70 font-medium lowercase italic">Mara sogo</span>
              </div>
            </Button>
          </a>
        </div>

        {/* ─── 1. BIBLIOGRAPHIE (À LA PLACE DE À PROPOS) ─── */}
        {holderMapped.bio && (
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card">
            <CardContent className="p-5">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold border-b border-border/25 pb-2 mb-3">
                Bibliographie
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed text-justify whitespace-pre-line">
                {holderMapped.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ─── 2. DESCRIPTION DE L'ORGANISATION ─── */}
        {org && (
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card">
            <CardContent className="p-5 flex flex-col space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold border-b border-border/25 pb-2">
                Organisation
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 relative rounded-full overflow-hidden border border-border/40 bg-white/15 flex items-center justify-center">
                  {org.logoUrl ? (
                    <img 
                      src={org.logoUrl} 
                      alt={org.nom} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">{org.nom.substring(0, 2)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground leading-none">{org.nom}</h2>
                  <span className="text-[10px] text-brand-green font-medium mt-0.5 inline-block">{org.secteur}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed text-justify">{org.description}</p>
              
              <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border/20 text-[11px] text-foreground/70">
                {org.siteWeb && (
                  <a href={org.siteWeb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-orange transition-colors">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Site web</span>
                  </a>
                )}
                {org.telephone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{org.telephone}</span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 3. COORDONNÉES RAPIDES ─── */}
        <Card className="border-border/40 shadow-xl overflow-hidden bg-card">
          <CardContent className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold border-b border-border/25 pb-2 mb-4">
              Coordonnées rapides
            </h3>
            <div className="grid grid-cols-4 gap-4 w-full">
              {/* Téléphone */}
              {holderMapped.phone && (
                <a 
                  href={`tel:${holderMapped.phone}`}
                  className="flex flex-col items-center gap-1.5 group"
                  title="Appeler"
                >
                  <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-brand-orange/15 border border-border/50 group-hover:border-brand-orange/40 transition-all duration-300">
                    <Phone className="w-5 h-5 text-foreground/90 group-hover:text-brand-orange group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">Appeler</span>
                </a>
              )}

              {/* WhatsApp */}
              {holderMapped.whatsapp && (
                <a 
                  href={`https://wa.me/${holderMapped.whatsapp.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                  title="WhatsApp"
                >
                  <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-brand-green/15 border border-border/50 group-hover:border-brand-green/40 transition-all duration-300">
                    <MessageSquare className="w-5 h-5 text-foreground/90 group-hover:text-brand-green group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">WhatsApp</span>
                </a>
              )}

              {/* Email */}
              {holderMapped.email && (
                <a 
                  href={`mailto:${holderMapped.email}`}
                  className="flex flex-col items-center gap-1.5 group"
                  title="Email"
                >
                  <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-blue-500/15 border border-border/50 group-hover:border-blue-500/40 transition-all duration-300">
                    <Mail className="w-5 h-5 text-foreground/90 group-hover:text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">Email</span>
                </a>
              )}

              {/* Localisation */}
              {holderMapped.googleMapsUrl && (
                <a 
                  href={holderMapped.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                  title="Adresse"
                >
                  <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-red-500/15 border border-border/50 group-hover:border-red-500/40 transition-all duration-300">
                    <MapPin className="w-5 h-5 text-foreground/90 group-hover:text-red-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">Adresse</span>
                </a>
              )}
            </div>

            {/* Réseaux sociaux */}
            <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-border/20 w-full">
              {holderMapped.linkedin && (
                <a 
                  href={holderMapped.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-blue-600/15 hover:border-blue-500/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {holderMapped.facebook && (
                <a 
                  href={holderMapped.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-blue-700/15 hover:border-blue-600/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {holderMapped.instagram && (
                <a 
                  href={holderMapped.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-pink-600/15 hover:border-pink-500/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {holderMapped.twitter && (
                <a 
                  href={holderMapped.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-slate-500/15 hover:border-slate-400/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {holderMapped.website && (
                <a 
                  href={holderMapped.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-brand-orange/15 hover:border-brand-orange/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── 4. DOCUMENTS D'ACCOMPAGNEMENT (CV & LETTRE DE MOTIVATION) ─── */}
        <PublicDocumentsSection 
          holderId={holderMapped.id}
          holderName={holderMapped.name}
          cvUrl={holderMapped.cvUrl}
          lettreMotivationUrl={holderMapped.lettreMotivationUrl}
        />

        {/* Footer de marque */}
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-[10px] text-muted-foreground/60 tracking-wider uppercase font-semibold">
            Propulsé par <span className="text-brand-orange font-bold">Baarako Card</span>
          </p>
          <p className="text-[9px] text-muted-foreground/45 mt-0.5">
            Carte de contact professionnelle intelligente
          </p>
        </div>

      </div>
    </main>
  )
}

// Composant d'affichage de l'état d'erreur ou d'indisponibilité du profil
function InactiveProfileMessage({ reason }: { reason: "non_existent" | "inactive" | "suspended" }) {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md text-center flex flex-col items-center space-y-6">
        <div className="w-16 h-16 rounded-full glass-panel border border-brand-red/30 flex items-center justify-center shadow-lg animate-bounce">
          <AlertCircle className="w-8 h-8 text-brand-red" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground font-sans">Profil non disponible</h1>
          <p className="text-xs font-mono text-brand-red/80 lowercase italic font-semibold">Profil ma sôrô</p>
          <p className="text-sm text-muted-foreground px-4 leading-relaxed">
            {reason === "non_existent" 
              ? "Cette carte ne correspond à aucun profil enregistré."
              : "Le titulaire a temporairement suspendu ou désactivé cette carte de contact."}
          </p>
        </div>
        
        <div className="pt-4 w-full">
          <Link href="/admin">
            <Button variant="secondary" size="default" className="text-xs cursor-pointer">
              Accéder au Dashboard d'administration
            </Button>
          </Link>
        </div>
        
        <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest pt-8">
          Baarako Card Security System
        </p>
      </div>
    </main>
  )
}
