// Onglet Organisations (Affichage et gestion des entités corporatives)
"use client"

import * as React from "react"
import Image from "next/image"
import { Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CardHolder, Organization } from "@/lib/types"

interface OrgsTabProps {
  holders: CardHolder[]
  organizations: Organization[]
}

export function OrgsTab({ holders, organizations }: OrgsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {organizations.map(org => {
        // Filtrer les titulaires appartenant à cette organisation
        const orgHolders = holders.filter(h => h.organizationId === org.id)
        
        return (
          <Card key={org.id} className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border/30 overflow-hidden relative flex items-center justify-center shrink-0">
                  {org.logoUrl ? (
                    <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base font-bold">{org.name}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] px-2 mt-1">
                    {org.sector}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {org.description || "Aucune description fournie pour cette organisation."}
              </p>
              
              <div className="pt-3 border-t border-border/30 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Titulaires rattachés :</span>
                  <span className="font-bold text-foreground">{orgHolders.length}</span>
                </div>
                
                {org.website && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Site web :</span>
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-orange hover:underline truncate max-w-[180px]"
                    >
                      {org.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Salariés ou collaborateurs inscrits */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">
                  Salariés inscrits :
                </span>
                <div className="flex -space-x-2 overflow-hidden py-1">
                  {orgHolders.map(h => (
                    <div
                      key={h.id}
                      className="w-8 h-8 rounded-full border-2 border-background overflow-hidden relative shrink-0"
                      title={`${h.name} - ${h.title}`}
                    >
                      <Image
                        src={h.avatarUrl || "/avatars/ousmane.png"}
                        alt={h.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {orgHolders.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">
                      Aucun titulaire pour le moment
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
