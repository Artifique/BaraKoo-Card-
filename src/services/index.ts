/**
 * Point d'entrée unique du dossier services/
 * Réexporte tous les services métier de l'application.
 *
 * Usage dans les routes API :
 *   import { getAllHolders, createHolder } from "@/services"
 */

export {
  getAllHolders,
  getHolderById,
  createHolder,
  updateHolder
} from "./HolderService"

export {
  getAllCardsWithStats,
  getCardBySlug,
  createCard,
  updateCard,
  recordScan,
  recordSave
} from "./CardService"

export {
  getAllOrganizations,
  getOrganizationById
} from "./OrganizationService"

export {
  getAllOrders
} from "./OrderService"
