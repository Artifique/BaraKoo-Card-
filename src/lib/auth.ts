// Utilitaires de sécurité pour l'authentification administrateur
// Utilise l'API cryptographique native de Node.js (sans dépendance externe)
import crypto from "crypto"

// Clé de session secrète (32 octets) dérivée du secret d'environnement
const SECRET_KEY = process.env.SESSION_SECRET || "baarako-card-secret-key-2026-super-secure"
const KEY = crypto.createHash("sha256").update(SECRET_KEY).digest()
const IV_LENGTH = 16

/**
 * Hache un mot de passe en utilisant l'algorithme PBKDF2.
 * @param password Mot de passe en clair
 * @returns Hash hexadécimal
 */
export function hashPassword(password: string): string {
  const salt = "baarako_salt_2026_nfc_qr"
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
}

/**
 * Vérifie si le mot de passe correspond à un hash donné.
 * @param password Mot de passe en clair à tester
 * @param hash Hash stocké en base
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

/**
 * Chiffre les données de session en AES-256-CBC pour le cookie.
 * @param data Données de l'administrateur
 * @returns Chaîne chiffrée contenant l'IV et le texte chiffré
 */
export function encryptSession(data: { id: string; email: string; nom: string; role: string; expires: string }): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv)
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Déchiffre une session à partir d'un jeton de cookie.
 * @param token Jeton de cookie
 * @returns Données de session ou null si invalide/expiré
 */
export function decryptSession(token: string): { id: string; email: string; nom: string; role: string; expires: string } | null {
  try {
    const parts = token.split(":")
    if (parts.length !== 2) return null
    
    const iv = Buffer.from(parts[0], "hex")
    const encryptedText = parts[1]
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv)
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    
    const session = JSON.parse(decrypted)
    
    // Vérifier l'expiration
    if (new Date(session.expires) < new Date()) {
      return null
    }
    
    return session
  } catch (erreur) {
    console.error("Erreur de déchiffrement de session :", erreur)
    return null
  }
}
