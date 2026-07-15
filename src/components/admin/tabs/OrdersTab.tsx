// Onglet Commandes (Suivi commercial des ventes B2C/B2B et facturation)
"use client"

import * as React from "react"
import { useState } from "react"
import { ShoppingBag, Plus, Trash2, Search, HelpCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderCreateForm } from "../forms/OrderCreateForm"
import type { Order, Organization } from "@/lib/types"

interface OrdersTabProps {
  orders: Order[]
  organizations: Organization[]
  onAddOrder: (order: Order) => void
  onUpdateOrderStatus: (id: string, updates: { paymentStatus?: Order["paymentStatus"]; status?: Order["status"] }) => Promise<void>
  onDeleteOrder: (id: string) => Promise<void>
}

const STATUTS_LIVRAISON = [
  { value: "pending", label: "En attente", color: "text-muted-foreground bg-secondary/50 border-border/40" },
  { value: "processing", label: "En Production", color: "text-brand-orange bg-brand-orange/10 border-brand-orange/20" },
  { value: "shipped", label: "Expédié", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { value: "delivered", label: "Livré", color: "text-brand-green bg-brand-green/10 border-brand-green/20" },
] as const

const STATUTS_PAIEMENT = [
  { value: "pending", label: "En Attente", color: "text-brand-red bg-brand-red/10 border-brand-red/20" },
  { value: "paid", label: "Payé", color: "text-brand-green bg-brand-green/10 border-brand-green/20" },
  { value: "refunded", label: "Remboursé", color: "text-muted-foreground bg-secondary/50 border-border/40" },
] as const

export function OrdersTab({ orders, organizations, onAddOrder, onUpdateOrderStatus, onDeleteOrder }: OrdersTabProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Filtrer les commandes par recherche
  const ordersFiltrees = orders.filter(order =>
    order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.clientEmail && order.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateSuccess = (nouvelle: Order) => {
    onAddOrder(nouvelle)
    setIsAdding(false)
  }

  const handleStatusChange = async (
    id: string,
    type: "payment" | "delivery",
    value: string
  ) => {
    setLoadingId(id)
    try {
      if (type === "payment") {
        await onUpdateOrderStatus(id, { paymentStatus: value as Order["paymentStatus"] })
      } else {
        await onUpdateOrderStatus(id, { status: value as Order["status"] })
      }
    } finally {
      setLoadingId(null)
    }
  }

  const selectStyle = `
    appearance-none bg-transparent border-0 font-semibold text-xs py-1 pl-2 pr-6 rounded-lg outline-none cursor-pointer
    focus:ring-1 focus:ring-brand-orange/30 w-full transition-all
  `

  return (
    <div className="space-y-6">
      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border/40 rounded-2xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-orange/50 transition-colors"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Commande</span>
        </Button>
      </div>

      {/* Formulaire de création */}
      {isAdding && (
        <Card className="border border-brand-orange/20 bg-brand-orange/5">
          <CardContent className="pt-6">
            <OrderCreateForm
              organizations={organizations}
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsAdding(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Tableau des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi Commercial & Facturation B2C/B2B</CardTitle>
          <CardDescription>
            Enregistrez et gérez les commandes de cartes, ajustez les statuts de paiement et d'expédition.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground text-xs uppercase font-bold">
                  <th className="py-3 px-2">Référence</th>
                  <th className="py-3 px-2">Client / Commanditaire</th>
                  <th className="py-3 px-2">Type d'Offre</th>
                  <th className="py-3 px-2 text-center">Qté</th>
                  <th className="py-3 px-2">Statut Paiement</th>
                  <th className="py-3 px-2">Statut Livraison</th>
                  <th className="py-3 px-2 text-right">Date</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersFiltrees.map(order => {
                  const currentPayment = STATUTS_PAIEMENT.find(p => p.value === order.paymentStatus)
                  const currentDelivery = STATUTS_LIVRAISON.find(d => d.value === order.status)

                  return (
                    <tr key={order.id} className="border-b border-border/20 hover:bg-muted/10 text-foreground transition-colors">
                      <td className="py-3.5 px-2 font-mono text-xs text-brand-orange font-bold">
                        {order.id.slice(0, 12)}
                        {order.id.length > 12 && "..."}
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="font-semibold text-xs">{order.clientName}</div>
                        {order.clientEmail && (
                          <div className="text-[10px] text-muted-foreground">{order.clientEmail}</div>
                        )}
                        {order.clientPhone && (
                          <div className="text-[10px] text-muted-foreground/80">{order.clientPhone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-2 capitalize text-xs">
                        {order.offerType === "simple_qr" && "Carte simple QR"}
                        {order.offerType === "nfc_qr" && "Carte NFC + QR"}
                        {order.offerType === "enterprise" && "Pack Entreprise"}
                      </td>
                      <td className="py-3.5 px-2 text-center font-bold text-xs">{order.quantity}</td>
                      
                      {/* Statut Paiement (Select) */}
                      <td className="py-3.5 px-2">
                        <div className={`relative inline-block border rounded-full px-2 py-0.5 min-w-[100px] text-center ${currentPayment?.color || ""}`}>
                          <select
                            disabled={loadingId === order.id}
                            value={order.paymentStatus}
                            onChange={e => handleStatusChange(order.id, "payment", e.target.value)}
                            className={selectStyle}
                          >
                            {STATUTS_PAIEMENT.map(p => (
                              <option key={p.value} value={p.value} className="bg-background text-foreground">
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Statut Livraison (Select) */}
                      <td className="py-3.5 px-2">
                        <div className={`relative inline-block border rounded-full px-2 py-0.5 min-w-[120px] text-center ${currentDelivery?.color || ""}`}>
                          <select
                            disabled={loadingId === order.id}
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, "delivery", e.target.value)}
                            className={selectStyle}
                          >
                            {STATUTS_LIVRAISON.map(d => (
                              <option key={d.value} value={d.value} className="bg-background text-foreground">
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="py-3.5 px-2 text-right text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>

                      {/* Supprimer Commande */}
                      <td className="py-3.5 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={loadingId === order.id}
                          onClick={() => onDeleteOrder(order.id)}
                          className="w-7 h-7 rounded-lg text-brand-red hover:bg-brand-red/10"
                          title="Supprimer la commande"
                        >
                          {loadingId === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
                {ordersFiltrees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-xs py-8 text-muted-foreground">
                      Aucune commande enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
