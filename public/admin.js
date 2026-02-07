const SUPABASE_URL = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ================= DOM SAFE =================

const mainColor = document.getElementById("mainColor");
const whatsappInput = document.getElementById("whatsappInput");
const logoFile = document.getElementById("logoFile");
const saveVisualBtn = document.getElementById("saveVisual");

const prodName = document.getElementById("prodName");
const prodPrice = document.getElementById("prodPrice");
const prodImage = document.getElementById("prodImage");
const saveProductBtn = document.getElementById("saveProduct");
const productList = document.getElementById("productList");

// ================= LOAD SETTINGS =================

async function loadSettings() {
  const { data } = await supabaseClient
    .from("site_settings")
    .select("*")
    .eq("key", "main")
    .maybeSingle();

  if (!data) return;

  if (mainColor) mainColor.value = data.main_color || "#314134";
  if (whatsappInput) whatsappInput.value = data.whatsapp_number || "";
}

// ================= SAVE SETTINGS =================

async function saveSettings() {
  if (!mainColor) return;

  const payload = {
    key: "main",
    main_color: mainColor.value,
    whatsapp_number: whatsappInput?.value || ""
  };

  if (logoFile?.files[0]) {
    const path = "logo-" + Date.now();

    const upload = await supabaseClient.storage
      .from("site-assets")
      .upload(path, logoFile.files[0], { upsert: true });

    if (!upload.error) {
      payload.logo_url = supabaseClient.storage
        .from("site-assets")
        .getPublicUrl(path).data.publicUrl;
    }
  }

  const { error } = await supabaseClient
    .from("site_settings")
    .upsert(payload, { onConflict: "key" });

  if (error) alert(error.message);
  else alert("Visual atualizado!");
}

// ================= PRODUCTS =================

async function loadProducts() {
  if (!productList) return;

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
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

// ================= SAVE PRODUCT =================

async function saveProduct() {
  if (!prodName || !prodPrice) return;

  const name = prodName.value.trim();
  const price = prodPrice.value;

  if (!name || !price) return alert("Nome e preço obrigatórios");

  let imageUrl = null;

  if (prodImage?.files[0]) {
    const path = "products/" + Date.now() + "-" + prodImage.files[0].name;

    const upload = await supabaseClient.storage
      .from("product-images")
      .upload(path, prodImage.files[0], { upsert: true });

    if (!upload.error) {
      imageUrl = supabaseClient.storage
        .from("product-images")
        .getPublicUrl(path).data.publicUrl;
    }
  }

  const { error } = await supabaseClient.from("products").insert({
    name,
    price,
    image_url: imageUrl,
    active: true
  });

  if (error) alert(error.message);
  else loadProducts();
}

// ================= EVENTS =================

if (saveVisualBtn) saveVisualBtn.onclick = saveSettings;
if (saveProductBtn) saveProductBtn.onclick = saveProduct;

// ================= INIT =================

loadSettings();
loadProducts();
