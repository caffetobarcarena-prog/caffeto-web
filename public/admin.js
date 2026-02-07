// ================================
// SUPABASE CONFIG
// ================================

const SUPABASE_URL = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ================================
// ELEMENTS
// ================================

const mainColor = document.getElementById("mainColor");
const whatsappInput = document.getElementById("whatsappInput");
const logoFile = document.getElementById("logoFile");

const saveVisualBtn = document.getElementById("saveVisual");

const prodName = document.getElementById("prodName");
const prodPrice = document.getElementById("prodPrice");
const prodImage = document.getElementById("prodImage");
const saveProductBtn = document.getElementById("saveProduct");
const productList = document.getElementById("productList");

// ================================
// LOAD SETTINGS
// ================================

async function loadSettings() {
  const { data, error } = await supabaseClient
    .from("site_settings")
    .select("*")
    .eq("key", "main")
    .maybeSingle();

  if (error) {
    console.error("Erro settings:", error);
    return;
  }

  if (!data) return;

  if (mainColor) mainColor.value = data.main_color || "#314134";
  if (whatsappInput) whatsappInput.value = data.whatsapp_number || "";
}

// ================================
// SAVE SETTINGS
// ================================

async function saveSettings() {
  const color = mainColor?.value || "#314134";
  const whatsapp = whatsappInput?.value || "";
  const file = logoFile?.files[0];

  let logoUrl = null;

  if (file) {
    const path = "logo-" + Date.now();

    const upload = await supabaseClient.storage
      .from("site-assets")
      .upload(path, file, { upsert: true });

    if (upload.error) {
      alert("Erro logo: " + upload.error.message);
      return;
    }

    logoUrl = supabaseClient.storage
      .from("site-assets")
      .getPublicUrl(path).data.publicUrl;
  }

  const payload = {
    key: "main",
    main_color: color,
    whatsapp_number: whatsapp
  };

  if (logoUrl) payload.logo_url = logoUrl;

  const { error } = await supabaseClient
    .from("site_settings")
    .upsert(payload, { onConflict: "key" });

  if (error) alert(error.message);
  else alert("Visual atualizado!");
}

// ================================
// LOAD PRODUCTS
// ================================

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    alert("Erro menu: " + error.message);
    return;
  }

  productList.innerHTML = "";

  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "menu-item";

    div.innerHTML = `
      ${p.image_url ? `<img src="${p.image_url}" class="thumb">` : ""}
      <strong>${p.name}</strong><br>
      R$ ${Number(p.price).toFixed(2)}
    `;

    productList.appendChild(div);
  });
}

// ================================
// SAVE PRODUCT
// ================================

async function saveProduct() {
  const name = prodName.value.trim();
  const price = prodPrice.value;
  const file = prodImage.files[0];

  if (!name || !price) {
    alert("Nome e preço obrigatórios.");
    return;
  }

  let imageUrl = null;

  if (file) {
    const path = "products/" + Date.now() + "-" + file.name;

    const upload = await supabaseClient.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (upload.error) {
      alert("Erro upload: " + upload.error.message);
      return;
    }

    imageUrl = supabaseClient.storage
      .from("product-images")
      .getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabaseClient.from("products").insert({
    name,
    price,
    image_url: imageUrl,
    active: true
  });

  if (error) alert(error.message);
  else {
    prodName.value = "";
    prodPrice.value = "";
    prodImage.value = "";
    loadProducts();
  }
}

// ================================
// EVENTS
// ================================

if (saveVisualBtn) saveVisualBtn.onclick = saveSettings;
if (saveProductBtn) saveProductBtn.onclick = saveProduct;

// ================================
// INIT
// ================================

loadSettings();
loadProducts();
