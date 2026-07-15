// Test d'upload vers le bucket Supabase Storage
// Exécuter avec : node scripts/test-upload.js

const fs = require("fs")
const path = require("path")

const SUPABASE_URL = "https://uexrmasfpxqdkethvoqv.supabase.co"
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleHJtYXNmcHhxZGtldGh2b3F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDEwNjk4NSwiZXhwIjoyMDk5NjgyOTg1fQ.B8257Y1Cpm_vsbd_pQ3fjjvt6ptmoSWWCANCUHIQ6as"

async function testUpload() {
  console.log("⏳ Test d'upload vers bucket-images...")

  // Créer un petit PNG de test (1x1 pixel rouge en base64)
  const tiny1x1Red = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  )

  const fileName = `test-${Date.now()}.png`
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/bucket-images/${fileName}`

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "apikey": SERVICE_ROLE_KEY,
      "Content-Type": "image/png"
    },
    body: tiny1x1Red
  })

  if (res.ok) {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/bucket-images/${fileName}`
    console.log("✅ Upload réussi !")
    console.log("   URL publique :", publicUrl)
  } else {
    const err = await res.json()
    console.error("❌ Erreur d'upload :", err)
  }
}

testUpload().catch(console.error)
