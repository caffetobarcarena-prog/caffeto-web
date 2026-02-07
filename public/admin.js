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
// AUTH CHECK
// ================================

async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = "/admin-login.html";
  }
}

checkAuth();

// ================================
// TAB SYSTEM
// ================================

function initTabs() {
  const buttons = document.querySelectorAll("nav button");
  const tabs = document.querySelectorAll(".tab");

  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove("active"));
      tabs.forEach(t => t.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(btn.dataset.tab)?.classList.add("active");
    };
  });
}

initTabs();

// ================================
// DOM
// ================================

const prodName = document.getElementById("prodName");
const prodPrice = document.getElementById("prodPrice");
const prodImageInput = document.getElementById("prodImage");
const previewImg = document.getElementById("imagePreview");
const saveProductBtn = document.getElementById("saveProduct");

const mainColor = document.getElementById("mainColor");
const whatsappInput = document.getElementById("whatsappInput");
const logoFile = document.getElementById("logoFile");
const saveVisualBtn = document.getElementById("saveVisual");

// ================================
// IMAGE PREVIEW
// ================================

if (prodImageInput && previewImg) {
  prodImageInput.onchange = e => {
    const file = e.target.files[0];
    if (file) previewImg.src = URL.createObjectURL(file);
  };
}

// ================================
// LOAD PRODUCTS
// ================================

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("id");

  if (error) {
    alert("Erro menu: " + error.message);
    return;
  }

  const list = document.getElementById("productList");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <strong>${p.name}</strong><br>
      R$ ${p.price}<br>
      ${
        p.image_url
          ? `<img src="${p.image_url}" class="preview">`
          : ""
      }
    `;

    list.appendChild(div);
  });
}

loadProducts();

// ================================
// SAVE PRODUCT
// ================================

if (saveProductBtn) {
  saveProductBtn.onclick = async () => {
    const name = prodName.value.trim();
    const price = prodPrice.value;
    const file = prodImageInput.files[0];

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
        alert(upload.error.message);
        return;
      }

      imageUrl = supabaseClient.storage
        .from("product-images")
        .getPublicUrl(path).data.publicUrl;
    }

    const insert = await supabaseClient.from("products").insert({
      name,
      price,
      image_url: imageUrl,
      active: true
    });

    if (insert.error) {
      alert(insert.error.message);
      return;
    }

    prodName.value = "";
    prodPrice.value = "";
    prodImageInput.value = "";
    previewImg.src = "";

    loadProducts();
  };
}

// ================================
// LOAD SITE SETTINGS
// ================================

async function loadSettings() {
  const { data } = await supabaseClient
    .from("site_settings")
    .select("*")
    .eq("key", "main")
    .limit(1);

  if (!data || !data.length) return;

  const s = data[0];

  if (mainColor && s.main_color) mainColor.value = s.main_color;
  if (whatsappInput && s.whatsapp_number)
    whatsappInput.value = s.whatsapp_number;
}

loadSettings();

// ================================
// SAVE VISUAL
// ================================

if (saveVisualBtn) {
  saveVisualBtn.onclick = async () => {
    const color = mainColor?.value || "#2f1b0c";
    const whatsapp = whatsappInput?.value || "";
    const file = logoFile?.files[0];

    let logoUrl = null;

    if (file) {
      const path = "logo-" + Date.now();

      const upload = await supabaseClient.storage
        .from("site-assets")
        .upload(path, file, { upsert: true });

      if (upload.error) {
        alert(upload.error.message);
        return;
      }

      logoUrl = supabaseClient.storage
        .from("site-assets")
        .getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      key: "main",
      value: "settings",
      main_color: color,
      whatsapp_number: whatsapp
    };

    if (logoUrl) payload.logo_url = logoUrl;

    const save = await supabaseClient
      .from("site_settings")
      .upsert(payload, { onConflict: "key" });

    if (save.error) alert(save.error.message);
    else alert("Visual atualizado!");
  };
}

// ================================
// CSV
// ================================

function downloadCSV(rows, filename) {
  if (!rows || !rows.length) return;

  const header = Object.keys(rows[0]).join(",");
  const csv =
    header +
    "\n" +
    rows.map(r => Object.values(r).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
