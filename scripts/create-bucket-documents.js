// Script de création du bucket "bucket-documents" dans Supabase Storage
// Exécuter avec : node scripts/create-bucket-documents.js
const fs = require("fs");
const path = require("path");

function parseEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    console.error(".env file not found at", envPath);
    return {};
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.substring(0, idx).trim();
    let val = trimmed.substring(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
  return env;
}

async function createBucket() {
  const env = parseEnv();
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseKey = env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!supabaseUrl || !supabaseKey) {
    console.error("Configuration Supabase manquante dans .env");
    return;
  }

  console.log("⏳ Création du bucket 'bucket-documents' avec la clé service_role...");

  const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "bucket-documents",
      name: "bucket-documents",
      public: true,
      file_size_limit: 10485760, // 10 MB
      allowed_mime_types: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]
    })
  });

  const data = await res.json();

  if (res.ok) {
    console.log("✅ Bucket 'bucket-documents' créé avec succès !");
    console.log("   - Public : true");
    console.log("   - Taille max : 10 MB");
    console.log("   - Types autorisés : PDF, DOC, DOCX");
  } else if (res.status === 409 || JSON.stringify(data).includes("already exists")) {
    console.log("ℹ️ Le bucket 'bucket-documents' existe déjà. Mise à jour en cours...");

    const updateRes = await fetch(`${supabaseUrl}/storage/v1/bucket/bucket-documents`, {
      method: "PUT",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public: true,
        file_size_limit: 10485760,
        allowed_mime_types: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
      })
    });

    const updateData = await updateRes.json();
    if (updateRes.ok) {
      console.log("✅ Bucket mis à jour avec succès :", updateData);
    } else {
      console.error("❌ Impossible de mettre à jour le bucket :", updateData);
    }
  } else {
    console.error("❌ Erreur :", data);
  }
}

createBucket().catch(console.error);
