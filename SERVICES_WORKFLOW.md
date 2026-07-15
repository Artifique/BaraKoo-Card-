# Guide & Workflow : Gestion des Services d'une Organisation

Ce document décrit le fonctionnement et le workflow (fonctionnel et technique) de la gestion des **Services** (Départements/Pôles) d'une organisation dans l'application **Baarako Card**.

---

## 📋 Présentation du Workflow

Le workflow permet de structurer les collaborateurs au sein d'une organisation cliente en les associant à des départements spécifiques (ex: Direction Commerciale, Ressources Humaines, Service Technique).

```mermaid
graph TD
    A[Créer ou Éditer une Organisation] --> B[Ouvrir l'accordéon "Gérer les services"]
    B --> C[Ajouter des Services pour cette Org]
    C --> D[Créer/Modifier un Titulaire de Carte]
    D --> E[Sélectionner l'Organisation]
    E --> F[Sélectionner un Service parmi ceux de l'Org]
    F --> G[Affichage du badge Service sur le Profil Public]
```

---

## 🛠️ Description Technique des Étapes du Workflow

### 1. Structure de Données (Base de Données & Prisma)
Le modèle repose sur une structure relationnelle PostgreSQL gérée par Prisma :
* **Organisation (`Organization`)** : Possède une relation de type `One-to-Many` vers ses `services`.
* **Service (`Service`)** : 
  * Est obligatoirement rattaché à une organisation parente (`organizationId`).
  * Est lié de façon optionnelle à plusieurs titulaires (`titulaires`).
* **Titulaire (`CardHolder`)** :
  * Possède un champ optionnel `serviceId` pointant vers le service concerné.
  * Comportement à la suppression : Si un service est supprimé, le champ `serviceId` des titulaires associés passe automatiquement à `NULL` (`onDelete: SetNull`), préservant ainsi la fiche du titulaire.

---

### 2. Le Flux des Actions Utilisateur

#### Étape A : Définition des Services par Entreprise
1. L'administrateur se rend sur l'onglet **Organisations** du dashboard.
2. Chaque carte d'organisation contient un accordéon repliable nommé **"Gérer les services (X)"** (avec $X$ le nombre de services actuellement définis).
3. L'administrateur clique sur ce bouton pour déployer la section.
4. **Ajout** : Il saisit un nom de service (ex: `RH`) et une description optionnelle puis clique sur **Créer le service**. L'appel API `POST /api/services` est émis, la donnée est persistée en base, et la liste locale est rafraîchie de façon réactive.
5. **Modification/Suppression** : Des icônes de crayon (modifier) et de corbeille (supprimer) permettent de mettre à jour le nom/description ou de retirer un service instantanément.

#### Étape B : Association d'un Collaborateur à un Service
1. L'administrateur va sur l'onglet **Titulaires** et clique sur **Nouvelle Fiche** (ou édite une fiche existante).
2. Il commence par sélectionner l'**Organisation / Entreprise** de rattachement.
3. Dès qu'une organisation est sélectionnée, le champ dynamique **Service / Département** apparaît juste en dessous.
4. Ce champ est pré-rempli avec la liste filtrée des services créés précédemment pour cette entreprise spécifique.
5. L'administrateur sélectionne le service approprié et enregistre la fiche.

#### Étape C : Rendu sur la Carte de Visite Virtuelle
1. Lorsqu'un client ou un contact scanne le QR code ou la puce NFC de la carte physique, il accède au profil en ligne du titulaire (`/[slug]`).
2. La page publique effectue une jointure en base de données pour récupérer l'organisation et le service associé.
3. Le nom du service s'affiche sous forme de badge stylisé juste en dessous du Poste/Fonction de la personne (ex: `Service : Direction Commerciale`).

---

## 📡 Spécifications des Endpoints API (`/api/services`)

| Méthode | Paramètre / Body | Description | Retour attendu |
| :--- | :--- | :--- | :--- |
| **`GET`** | `?organizationId=id_org` | Récupère la liste des services d'une organisation | Tableau JSON de services triés par nom |
| **`POST`** | `{ nom, description, organizationId }` | Crée un nouveau service | Objet service créé avec son `id` |
| **`PUT`** | `{ id, nom, description }` | Modifie un service existant | Objet service mis à jour |
| **`DELETE`** | `?id=id_service` | Supprime un service de la DB | `{ success: true, message: "..." }` |

---

## 🎨 Composants Clés Modifiés ou Créés
* [schema.prisma](file:///c:/Users/USER/Desktop/PROJET/BarakoCard/prisma/schema.prisma) : Contrat d'intégrité de la base de données.
* [ServiceService.ts](file:///c:/Users/USER/Desktop/PROJET/BarakoCard/src/services/ServiceService.ts) : Logique d'accès aux données PostgreSQL.
* [route.ts](file:///c:/Users/USER/Desktop/PROJET/BarakoCard/src/app/api/services/route.ts) : Point d'accès REST.
* [OrgsTab.tsx](file:///c:/Users/USER/Desktop/PROJET/BarakoCard/src/components/admin/tabs/OrgsTab.tsx) : Interface d'administration pour la gestion des services par organisation.
* [HolderCreateForm.tsx](file:///c:/Users/USER/Desktop/PROJET/BarakoCard/src/components/admin/forms/HolderCreateForm.tsx) / [HolderEditForm.tsx](file:///c:/Users/USER/Desktop/PROJET/BarakoCard/src/components/admin/forms/HolderEditForm.tsx) : Formulaires avec selecteurs de services dynamiques.
* [page.tsx](file:///c:/Users/USER/Desktop/PROJET/BarakoCard/src/app/[slug]/page.tsx) : Affichage public du service sur le profil.
