// Onglet du Tableau de bord administrateur (Statistiques et performances)
"use client"

import * as React from "react"
import { CreditCard, Activity, Download, BarChart3 } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "../KpiCard"
import { CardHolder, Card as CardType, CardStats } from "@/lib/types"

interface DashboardTabProps {
  holders: CardHolder[]
  cards: CardType[]
  stats: CardStats[]
}

export function DashboardTab({ holders, cards, stats }: DashboardTabProps) {
  // Calculer les totaux pour les KPIs
  const totalScans = stats.reduce((acc, curr) => acc + curr.scans, 0)
  const totalSaves = stats.reduce((acc, curr) => acc + curr.saves, 0)
  const activeCardsCount = cards.filter(c => c.status === "active").length
  const avgConversion = totalScans > 0 ? Math.round((totalSaves / totalScans) * 100) : 0

  // Répartition QR vs NFC
  const totalQrScans = stats.reduce((acc, curr) => acc + curr.qrScans, 0)
  const totalNfcScans = stats.reduce((acc, curr) => acc + curr.nfcScans, 0)
  
  // Par défaut s'il n'y a pas de scan, on met 50/50 pour la jauge
  const aDesScans = totalScans > 0
  const qrPercent = aDesScans ? Math.round((totalQrScans / totalScans) * 100) : 50
  const nfcPercent = aDesScans ? (100 - qrPercent) : 50

  return (
    <div className="space-y-6">
      {/* Grille de cartes KPI réutilisables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Cartes Actives"
          valeur={activeCardsCount}
          icone={<CreditCard className="w-5 h-5" />}
          couleurAccent="bg-brand-green/10 border-brand-green/20 text-brand-green"
        />

        <KpiCard
          label="Total Scans"
          valeur={totalScans}
          icone={<Activity className="w-5 h-5" />}
          couleurAccent="bg-brand-orange/10 border-brand-orange/20 text-brand-orange"
        />

        <KpiCard
          label="Contacts Enregistrés"
          valeur={totalSaves}
          icone={<Download className="w-5 h-5" />}
          couleurAccent="bg-blue-500/10 border-blue-500/20 text-blue-400"
        />

        <KpiCard
          label="Taux de Conversion"
          valeur={`${avgConversion}%`}
          icone={<BarChart3 className="w-5 h-5" />}
          couleurAccent="bg-purple-500/10 border-purple-500/20 text-purple-400"
        />
      </div>

      {/* Rapports détaillés de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance par profil */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance par Profil</CardTitle>
            <CardDescription>Rapport détaillé des visites sur les cartes physiques émises.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground text-xs uppercase font-bold">
                    <th className="py-3 px-2">Titulaire</th>
                    <th className="py-3 px-2">Identifiant</th>
                    <th className="py-3 px-2 text-center">Scans</th>
                    <th className="py-3 px-2 text-center">Enregistrés</th>
                    <th className="py-3 px-2 text-center">Conversion</th>
                    <th className="py-3 px-2 text-right">Dernier Scan</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.map(holder => {
                    const holderCard = cards.find(c => c.holderId === holder.id)
                    const holderStat = holderCard ? stats.find(s => s.cardId === holderCard.id) : null
                    const scans = holderStat?.scans || 0
                    const saves = holderStat?.saves || 0
                    const conversion = scans > 0 ? Math.round((saves / scans) * 100) : 0
                    
                    return (
                      <tr key={holder.id} className="border-b border-border/20 hover:bg-muted/10 text-foreground">
                        <td className="py-3.5 px-2 flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden relative border border-border/30">
                            <Image 
                              src={holder.avatarUrl || "/avatars/ousmane.png"} 
                              alt={holder.name} 
                              fill 
                              className="object-cover" 
                            />
                          </div>
                          <span className="font-semibold">{holder.name}</span>
                        </td>
                        <td className="py-3.5 px-2 text-xs font-mono text-brand-green/80">{holder.id}</td>
                        <td className="py-3.5 px-2 text-center font-semibold">{scans}</td>
                        <td className="py-3.5 px-2 text-center text-blue-400 font-semibold">{saves}</td>
                        <td className="py-3.5 px-2 text-center">
                          <Badge variant={conversion >= 50 ? "success" : "secondary"}>
                            {conversion}%
                          </Badge>
                        </td>
                        <td className="py-3.5 px-2 text-right text-xs text-muted-foreground">
                          {holderStat?.lastScanAt ? new Date(holderStat.lastScanAt).toLocaleString("fr-FR") : "Aucun scan"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Distribution des sources (QR vs NFC) */}
        <Card>
          <CardHeader>
            <CardTitle>Sources de redirection</CardTitle>
            <CardDescription>Comparaison NFC vs QR Code.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col justify-center items-center space-y-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Cercle visuel décoratif */}
              <div className="absolute inset-0 rounded-full border-8 border-brand-orange/20" />
              <div 
                className="absolute inset-0 rounded-full border-8 border-brand-orange border-t-transparent border-l-transparent transition-transform duration-500" 
                style={{ transform: `rotate(${Math.min(360, (qrPercent / 100) * 360)}deg)` }}
              />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-foreground">{totalScans}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Visites</span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                  QR Code (Scans Web)
                </span>
                <span className="font-bold text-foreground">
                  {aDesScans ? `${qrPercent}% (${totalQrScans})` : "0% (0)"}
                </span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-orange h-full transition-all duration-500" style={{ width: `${aDesScans ? qrPercent : 0}%` }} />
              </div>
              
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
                  Ondes NFC (Contact direct)
                </span>
                <span className="font-bold text-foreground">
                  {aDesScans ? `${nfcPercent}% (${totalNfcScans})` : "0% (0)"}
                </span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-green h-full transition-all duration-500" style={{ width: `${aDesScans ? nfcPercent : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
