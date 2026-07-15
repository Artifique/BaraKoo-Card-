// Onglet Commandes (Suivi commercial des ventes B2C/B2B et facturation)
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Order } from "@/lib/types"

interface OrdersTabProps {
  orders: Order[]
}

export function OrdersTab({ orders }: OrdersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi Commercial & Facturation B2C/B2B</CardTitle>
        <CardDescription>
          Paiements hors plateforme (WhatsApp/Mobile Money) enregistrés manuellement par l'équipe.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/30 text-muted-foreground text-xs uppercase font-bold">
                <th className="py-3 px-2">Référence</th>
                <th className="py-3 px-2">Client</th>
                <th className="py-3 px-2">Type d'Offre</th>
                <th className="py-3 px-2 text-center">Quantité</th>
                <th className="py-3 px-2">Statut Paiement</th>
                <th className="py-3 px-2">Statut Livraison</th>
                <th className="py-3 px-2 text-right">Date de commande</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-border/20 hover:bg-muted/10 text-foreground">
                  <td className="py-3.5 px-2 font-mono text-xs text-brand-orange font-bold">
                    {order.id}
                  </td>
                  <td className="py-3.5 px-2">
                    <div className="font-semibold">{order.clientName}</div>
                    <div className="text-[10px] text-muted-foreground">{order.clientEmail}</div>
                  </td>
                  <td className="py-3.5 px-2 capitalize text-xs">
                    {order.offerType === "simple_qr" && "Carte simple QR"}
                    {order.offerType === "nfc_qr" && "Carte NFC + QR"}
                    {order.offerType === "enterprise" && "Pack Entreprise"}
                  </td>
                  <td className="py-3.5 px-2 text-center font-bold">{order.quantity}</td>
                  <td className="py-3.5 px-2">
                    <Badge
                      variant={order.paymentStatus === "paid" ? "success" : "destructive"}
                      className="text-[10px] font-semibold"
                    >
                      {order.paymentStatus === "paid" ? "Payé" : "En Attente"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-2 capitalize text-xs font-medium">
                    {order.status === "delivered" && (
                      <span className="text-brand-green">✓ Livré</span>
                    )}
                    {order.status === "processing" && (
                      <span className="text-brand-orange">⟳ En Production</span>
                    )}
                    {order.status === "shipped" && (
                      <span className="text-blue-400">⛟ Expédié</span>
                    )}
                    {order.status === "pending" && (
                      <span className="text-muted-foreground">⟳ En attente</span>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-right text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-xs py-8 text-muted-foreground">
                    Aucune commande enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
