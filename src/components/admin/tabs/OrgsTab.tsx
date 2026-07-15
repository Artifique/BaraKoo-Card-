// Onglet Organisations (Affichage et gestion des entités corporatives)
"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { Building2, Plus, Edit, Trash2, Search, ExternalLink, Phone, Mail, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrgCreateForm } from "../forms/OrgCreateForm"
import { OrgEditForm } from "../forms/OrgEditForm"
import { CardHolder, Organization } from "@/lib/types"

interface OrgsTabProps {
  holders: CardHolder[]
  organizations: Organization[]
  onAddOrg: (org: Organization) => void
  onEditOrg: (id: string, updates: Partial<Organization>) => Promise<void>
  onDeleteOrg: (id: string) => Promise<void>
}

export function OrgsTab({ holders, organizations, onAddOrg, onEditOrg, onDeleteOrg }: OrgsTabProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrer les organisations par recherche
  const orgsFiltrees = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateSuccess = (nouvelle: Organization) => {
    onAddOrg(nouvelle)
    setIsAdding(false)
  }

  const handleEditSuccess = async (updated: Organization) => {
    await onEditOrg(updated.id, updated)
    setEditingOrg(null)
  }

  return (
    <div className="space-y-6">
      {/* Barre d'outils et recherche */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border/40 rounded-2xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-orange/50 transition-colors"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingOrg(null)
            setIsAdding(true)
          }}
          className="flex items-center justify-center gap-2 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Organisation</span>
        </Button>
      </div>

      {/* Formulaire de création */}
      {isAdding && (
        <Card className="border border-brand-orange/20 bg-brand-orange/5">
          <CardContent className="pt-6">
            <OrgCreateForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsAdding(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Formulaire d'édition */}
      {editingOrg && (
        <Card className="border border-brand-orange/20 bg-brand-orange/5">
          <CardContent className="pt-6">
            <OrgEditForm
              organisation={editingOrg}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingOrg(null)}
            />
          </CardContent>
        </Card>
      )}

      {/* Liste des organisations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orgsFiltrees.map(org => {
          // Filtrer les titulaires appartenant à cette organisation
          const orgHolders = holders.filter(h => h.organizationId === org.id)

          return (
            <Card key={org.id} className="h-fit flex flex-col justify-between hover:border-brand-orange/30 transition-all duration-300 group">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-muted border border-border/30 overflow-hidden relative flex items-center justify-center shrink-0">
                        {org.logoUrl ? (
                          <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-foreground group-hover:text-brand-orange transition-colors">
                          {org.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px] px-2 mt-1">
                          {org.sector}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsAdding(false)
                          setEditingOrg(org)
                        }}
                        className="w-7 h-7 rounded-lg text-brand-orange hover:bg-brand-orange/10"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteOrg(org.id)}
                        className="w-7 h-7 rounded-lg text-brand-red hover:bg-brand-red/10"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {org.description || "Aucune description fournie pour cette organisation."}
                  </p>

                  <div className="pt-3 border-t border-border/30 space-y-2 text-xs">
                    {org.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{org.address}</span>
                      </div>
                    )}
                    {org.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{org.phone}</span>
                      </div>
                    )}
                    {org.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{org.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/30 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Titulaires rattachés :</span>
                      <span className="font-bold text-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/20">
                        {orgHolders.length}
                      </span>
                    </div>

                    {org.website && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Site web :</span>
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-orange hover:underline inline-flex items-center gap-1 truncate max-w-[180px]"
                        >
                          <span>Visiter</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Salariés ou collaborateurs inscrits */}
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">
                      Collaborateurs :
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
              </div>
            </Card>
          )
        })}

        {orgsFiltrees.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            Aucune organisation ne correspond à votre recherche.
          </div>
        )}
      </div>
    </div>
  )
}
