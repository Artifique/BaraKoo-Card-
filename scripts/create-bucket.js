// Script de création du bucket "bucket-images" dans Supabase Storage
// Exécuter avec : node scripts/create-bucket.js

const SUPABASE_URL = "https://uexrmasfpxqdkethvoqv.supabase.co"
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleHJtYXNmcHhxZGtldGh2b3F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDEwNjk4NSwiZXhwIjoyMDk5NjgyOTg1fQ.B8257Y1Cpm_vsbd_pQ3fjjvt6ptmoSWWCANCUHIQ6as"

async function createBucket() {
  console.log("⏳ Création du bucket 'bucket-images' avec la clé service_role...")

  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "bucket-images",
      name: "bucket-images",
      public: true,
      file_size_limit: 10485760, // 10 MB
      allowed_mime_types: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"]
    })
  })

  const data = await res.json()

  if (res.ok) {
    console.log("✅ Bucket 'bucket-images' créé avec succès !")
    console.log("   - Public : true")
    console.log("   - Taille max : 10 MB")
    console.log("   - Types autorisés : PNG, JPG, WEBP, GIF, SVG")
  } else if (res.status === 409 || JSON.stringify(data).includes("already exists")) {
    console.log("ℹ️  Le bucket 'bucket-images' existe déjà. Mise à jour en mode public...")

    const updateRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/bucket-images`, {
      method: "PUT",
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public: true,
        file_size_limit: 10485760,
        allowed_mime_types: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"]
      })
    })

    const updateData = await updateRes.json()
    if (updateRes.ok) {
      console.log("✅ Bucket mis à jour (public: true) :", updateData)
    } else {
      console.error("❌ Impossible de mettre à jour le bucket :", updateData)
    }
  } else {
    console.error("❌ Erreur :", data)
  }
}

createBucket().catch(console.error)
