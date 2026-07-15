# Guide de Déploiement sur Vercel - Baarako Card

Ce projet Next.js est prêt à être déployé sur la plateforme **Vercel**. Pour réussir le déploiement avec le support de Prisma et de la base de données PostgreSQL (Supabase), suivez ce guide étape par étape.

---

## 🛠️ 1. Configuration Préalable

Le script `"postinstall": "prisma generate"` a été ajouté dans votre [package.json](file:///c:/Users/USER/Desktop/PROJET/BarakoCard/package.json). 
Cela garantit que Vercel génère le client Prisma adapté à son système d'exploitation à chaque déploiement avant la phase de build de Next.js.

---

## 🚀 2. Méthodes de Déploiement

### Option A : Déploiement lié à Git (Recommandé)
Cette méthode permet de déployer automatiquement votre site à chaque fois que vous faites un `git push` sur votre branche principale.

1. **Publiez votre code sur Git** (GitHub, GitLab ou Bitbucket) :
   ```bash
   git init
   git add .
   git commit -m "Prêt pour déploiement Vercel"
   # Liez à votre dépôt distant et poussez le code
   git remote add origin <URL_DE_VOTRE_DEPOT>
   git branch -M main
   git push -u origin main
   ```
2. **Connectez-vous** sur [Vercel](https://vercel.com).
3. Cliquez sur le bouton **"Add New..."** puis sur **"Project"**.
4. **Importez** votre dépôt Git.
5. Déroulez la section **"Environment Variables"** et ajoutez les variables requises (voir Section 3).
6. Cliquez sur **"Deploy"**.

---

### Option B : Déploiement via la CLI Vercel
Si vous ne souhaitez pas utiliser Git, vous pouvez déployer directement depuis votre terminal local.

1. **Installez la CLI Vercel** globalement sur votre ordinateur :
   ```bash
   npm install -g vercel
   ```
2. **Connectez-vous** à votre compte Vercel depuis le terminal :
   ```bash
   vercel login
   ```
3. **Lancez le déploiement** à la racine de votre projet :
   ```bash
   vercel
   ```
4. Suivez les instructions interactives à l'écran (répondez Oui aux valeurs par défaut).
5. Une fois le projet initialisé sur Vercel, allez sur votre dashboard Vercel en ligne pour ajouter les variables d'environnement, puis redéployez avec la commande :
   ```bash
   vercel --prod
   ```

---

## 🔑 3. Configuration des Variables d'Environnement (Crucial)

Pour que l'application puisse se connecter à la base de données et téléverser des images sur votre bucket Supabase, vous **devez** configurer les variables suivantes dans l'onglet **Settings > Environment Variables** de votre projet sur Vercel :

| Nom de la variable | Valeur correspondante | Description |
| :--- | :--- | :--- |
| **`DATABASE_URL`** | `postgres://...` | URL de connexion avec pooling (fournie dans votre fichier `.env` actuel) |
| **`DIRECT_URL`** | `postgres://...` | URL de connexion directe (sans pooler) pour les migrations Prisma |
| **`SUPABASE_SERVICE_ROLE_KEY`** | `eyJhbGciOi...` | Clé secrète de rôle de service Supabase pour l'upload d'images |

---

## 🐳 4. Notes importantes pour Prisma sur Vercel

* **Prisma Client Cache** : Le script de post-installation configure automatiquement la génération de Prisma.
* **Serverless Functions Timeout** : Les requêtes vers la base de données via Vercel passent par des fonctions Serverless. Assurez-vous d'utiliser `DATABASE_URL` (avec le pooler de Supabase) pour éviter d'épuiser le nombre maximum de connexions simultanées de la base de données.
