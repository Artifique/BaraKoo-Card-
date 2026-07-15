# Baarako Card — Votre carte de visite digitale NFC & QR Code

Baarako Card est une application web moderne de cartes de visite professionnelles connectées, conçue pour faciliter le réseautage intelligent en Afrique. L'application combine la puissance des puces physiques NFC et la simplicité d'utilisation des QR Codes pour partager un profil professionnel bilingue et dynamique en un instant.

---

## 🚀 Fonctionnalités Clés

### 1. Profil Public Bilingue
* **Partage instantané** : QR Code ou NFC menant vers `baarako.card/[slug]`.
* **Identité visuelle premium** : Informations de contact, photo de profil, biographie, organisation et liens de réseaux sociaux.
* **Bilinguisme culturel** : Bouton d'action bilingue en Français & Bambara ("Enregistrer le contact / Mara sogo") téléchargeant directement une fiche de contact vCard (`.vcf`) structurée.
* **Statut en temps réel** : Affichage d'un badge dynamique de disponibilité (DISPONIBLE ou INDISPONIBLE).

### 2. Tableau de Bord Administrateur Sécurisé (`/admin`)
* **Sidebar Fixe & Navigation Fluide** : La barre latérale reste fixe à gauche sur desktop avec un défilement autonome de la zone de contenu principale à droite.
* **Statistiques KPI en temps réel** : Nombre de cartes actives, volume total de scans, nombre de contacts enregistrés, taux de conversion et graphes analytiques.
* **Gestion des Titulaires & Cartes** : Formulaires de création et d'édition de profils, activation/désactivation de cartes NFC, association à des organisations.
* **Topbar Contextuelle** : Contient l'indicateur d'état du système ("Système Connecté") et le sélecteur de mode d'affichage.
* **Bascule de Thème** : Mode Clair et Mode Sombre (Dark Navy) s'adaptant à l'ensemble du back-office.
* **Dialogues de Retour Utilisateur** : Boîtes de dialogue (modals) et notifications (toasts) très élégantes avec animations fluides et glassmorphism pour chaque succès ou erreur.

### 3. Authentification & Sécurité Admin
* **Sécurisation des accès** : Protection globale des pages d'administration par un middleware Next.js.
* **Authentification dédiée** : Écran de connexion sécurisé (`/login`) avec cookies cryptés HTTP-only (sans stockage local vulnérable).
* **Onglet Paramètres** : Modification directe du mot de passe administrateur en vérifiant l'ancien mot de passe.
* **Déconnexion** : Suppression propre de la session et redirection vers l'écran de login.

---

## 🛠️ Stack Technique

* **Framework** : [Next.js](https://nextjs.org/) (App Router)
* **Base de Données** : PostgreSQL hébergé sur [Supabase](https://supabase.com/)
* **ORM** : [Prisma ORM](https://www.prisma.io/) v6
* **Styling & Design** : [Tailwind CSS v4](https://tailwindcss.com/) avec variables CSS personnalisées, effets glassmorphic et animations d'entrée/sortie
* **Icônes** : [Lucide React](https://lucide.dev/)

---

## 📂 Architecture du Projet

Le projet applique une séparation stricte des responsabilités (separation of concerns) pour faciliter la maintenance :

```
├── prisma/
│   ├── schema.prisma       # Schéma de base de données PostgreSQL
│   └── seed.ts             # Données de démonstration et initialisation de l'administrateur
├── src/
│   ├── app/
│   │   ├── [slug]/         # Page de profil public dynamique
│   │   ├── admin/          # Tableau de bord administrateur (page d'accueil)
│   │   ├── login/          # Page de connexion d'administration
│   │   ├── api/            # API REST (auth, cartes, titulaires, vcard)
│   │   ├── globals.css     # Définition des variables de thèmes et styles
│   │   └── layout.tsx      # Layout racine enveloppant ThemeProvider & NotificationProvider
│   ├── components/
│   │   ├── admin/          # Composants exclusifs du dashboard (layout, sidebar, topbar)
│   │   │   └── tabs/       # Vues correspondantes aux différents onglets
│   │   └── ui/             # Composants d'interface génériques (boutons, cartes, toggles)
│   ├── hooks/
│   │   └── useAdminData.ts # Hook personnalisé centralisant les requêtes de données admin
│   ├── lib/
│   │   ├── auth.ts         # Fonctions de hashage et gestion des cookies de session
│   │   ├── prisma.ts       # Singleton du client Prisma
│   │   └── utils.ts        # Fonctions utilitaires générales (cn)
│   ├── models/             # Modèles et interfaces TypeScript métier
│   ├── providers/
│   │   ├── ThemeProvider.tsx        # Contexte du mode clair / sombre
│   │   └── NotificationProvider.tsx # Système de dialogues de succès/erreur et toasts
│   └── services/           # Couche logique d'accès aux données (HolderService, CardService, etc.)
```

---

## 🚀 Installation & Lancement en local

### 1. Cloner le projet
```bash
git clone https://github.com/Artifique/BaraKoo-Card-.git
cd BaraKoo-Card-
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
Créez un fichier `.env` à la racine du projet en vous inspirant du modèle suivant :
```env
# Connexion PostgreSQL (Pooler Supabase) pour l'application
DATABASE_URL="postgresql://postgres.uexrmasfpxqdkethvoqv:[VOTRE-MOT-DE-PASSE]@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connexion PostgreSQL Directe pour les migrations Prisma (port 5432)
DIRECT_URL="postgresql://postgres.uexrmasfpxqdkethvoqv:[VOTRE-MOT-DE-PASSE]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

# Clé secrète de session cryptographique (min. 32 caractères recommandés)
SESSION_SECRET="votre_super_cle_secrete_session_admin_2026"
```

### 4. Appliquer les migrations de base de données
```bash
npx prisma db push
```

### 5. Peupler la base de données (Seed)
Cette commande efface les données de test précédentes et insère les profils de démonstration, ainsi que l'administrateur par défaut :
* **Identifiant admin** : `admin@baarako.com`
* **Mot de passe par défaut** : `BarakoCard@2026`

```bash
npx prisma db seed
```

### 6. Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.
* Profil public d'exemple : [http://localhost:3000/ousmane-diarra](http://localhost:3000/ousmane-diarra)
* Tableau de bord administration : [http://localhost:3000/admin](http://localhost:3000/admin) (redirige vers `/login` pour vous connecter).
