-- CreateEnum
CREATE TYPE "RoleAdmin" AS ENUM ('SUPER_ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "StatutFiche" AS ENUM ('ACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "TypeCarte" AS ENUM ('QR_SEUL', 'NFC_SEUL', 'LES_DEUX');

-- CreateEnum
CREATE TYPE "StatutCarte" AS ENUM ('BROUILLON', 'PRET_A_PRODUIRE', 'EN_PRODUCTION', 'ENCODEE', 'EXPEDIEE', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TypeOffre" AS ENUM ('CARTE_SIMPLE_QR', 'CARTE_NFC_QR', 'PACK_ENTREPRISE');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'PAYE', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "StatutLivraison" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'EXPEDIEE', 'LIVREE');

-- CreateEnum
CREATE TYPE "MethodeScan" AS ENUM ('QR_CODE', 'NFC');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "RoleAdmin" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "logoUrl" TEXT,
    "secteur" TEXT,
    "description" TEXT,
    "adresse" TEXT,
    "siteWeb" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_holders" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "fonction" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "statut" "StatutFiche" NOT NULL DEFAULT 'ACTIF',
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "telephone" TEXT,
    "whatsapp" TEXT,
    "emailContact" TEXT,
    "adresse" TEXT,
    "lienMaps" TEXT,
    "linkedin" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "siteWeb" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "card_holders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "type" "TypeCarte" NOT NULL DEFAULT 'LES_DEUX',
    "statut" "StatutCarte" NOT NULL DEFAULT 'BROUILLON',
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "holderId" TEXT NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "typeOffre" "TypeOffre" NOT NULL,
    "statutPaiement" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "statutLivraison" "StatutLivraison" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_scans" (
    "id" TEXT NOT NULL,
    "methode" "MethodeScan" NOT NULL,
    "appareil" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "card_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_saves" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "contact_saves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cards_slug_key" ON "cards"("slug");

-- AddForeignKey
ALTER TABLE "card_holders" ADD CONSTRAINT "card_holders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "card_holders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_scans" ADD CONSTRAINT "card_scans_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_saves" ADD CONSTRAINT "contact_saves_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
