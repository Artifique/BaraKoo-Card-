// Test d'upload d'un document vers le bucket-documents Supabase Storage
// Exécuter avec : node scripts/test-upload-document.js

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

async function testUpload() {
  const env = parseEnv();
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseKey = env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!supabaseUrl || !supabaseKey) {
    console.error("Configuration Supabase manquante dans .env");
    return;
  }

  console.log("⏳ Test d'upload d'un document (fake PDF) vers bucket-documents...");

  // Créer un document PDF de test minimal en texte
  const fakePdfContent = Buffer.from("%PDF-1.4 ... Fake PDF Content for Test ... %%EOF");

  const fileName = `test-document-${Date.now()}.pdf`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/bucket-documents/${fileName}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${supabaseKey}`,
      "apikey": supabaseKey,
      "Content-Type": "application/pdf"
    },
    body: fakePdfContent
  });

  if (res.ok) {
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/bucket-documents/${fileName}`;
    console.log("✅ Upload de document réussi !");
    console.log("   URL publique :", publicUrl);
  } else {
    const err = await res.json();
    console.error("❌ Erreur d'upload :", err);
  }
}

testUpload().catch(console.error);
