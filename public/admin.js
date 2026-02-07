// =================================
// SUPABASE CONFIG
// =================================

const SUPABASE_URL = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// =================================
// AUTH
// =================================

async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    location.href = "/admin-login.html";
  }
}

checkAuth();

// =================================
// ELEMENTS SAFE LOAD
// =================================

const prodName = document.getElementById("prodName");
const prodPrice = document.getElementById("prodPrice");
const prodImageInput = document.getElementById("prodImage");
const previewImg = document.getElementById("imagePreview");

const mainColor = document.getElementById("mainColor");
const whatsappInput = document.getElementById("whatsappInput");
const logoFile = document.getElementById("logoFile");

const saveProductBtn = document.getElementById("saveProduct");
const saveVisualBtn = document.getElementById("saveVisual");

// =================================
// TABS
// =================================

function initTabs() {
  const buttons = document.querySelectorAll("nav button");
  const tabs = document.querySelectorAll(".tab");

  buttons.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.dataset.tab;

      buttons.forEach(b => b.classList.remove("active"));
      tabs.forEach(t => t.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(tab).classList.add("active");
    };
  });
}

initTabs();

// =================================
// IMAGE PREVIEW
// =================================

if (prodImageInput && previewImg) {
  prodImageInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    previewImg.src = URL.createObjectURL(file);
    previewImg.style.maxHeight = "160px";
    previewImg.style.objectFit = "contain";
  };
}

// =================================
// LOAD PRODUCTS
// =================================

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
      R$ ${Number(p.price).toFixed(2)}<br>
      ${
        p.image_url
          ? `<img src="${p.image_url}" style="max-height:120px;object-fit:contain;margin-top:8px">`
          : ""
      }
    `;

    list.appendChild(div);
  });
}

loadProducts();

// =================================
// SAVE PRODUCT
// =================================

if (saveProductBtn) {
  saveProductBtn.onclick = async () => {
    if (!prodName || !prodPrice) return;

    const name = prodName.value.trim();
    const price = prodPrice.value;
    const file = prodImageInput?.files[0];

    if (!name || !price) {
      alert("Nome e preço obrigatórios.");
      return;
    }

    let imageUrl = null;

    if (file) {
      const path = `products/${Date.now()}-${file.name}`;

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
    if (prodImageInput) prodImageInput.value = "";
    if (previewImg) previewImg.src = "";

    loadProducts();
  };
}

// =================================
// LOAD VISUAL SETTINGS
// =================================

async function loadVisualSettings() {
  const { data, error } = await supabaseClient
    .from("site_settings")
    .select("*")
    .single();

  if (error || !data) {
    console.warn("Site settings não carregado:", error?.message);
    return;
  }

  if (mainColor && data.main_color)
    mainColor.value = data.main_color;

  if (whatsappInput && data.whatsapp_number)
    whatsappInput.value = data.whatsapp_number;
}

loadVisualSettings();

// =================================
// SAVE VISUAL SETTINGS
// =================================

if (saveVisualBtn) {
  saveVisualBtn.onclick = async () => {
    const color = mainColor?.value || null;
    const whatsapp = whatsappInput?.value || null;
    const file = logoFile?.files[0];

    let logoUrl = null;

    if (file) {
      const path = `logo-${Date.now()}`;

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

    const payload = { id: 1 };

    if (color) payload.main_color = color;
    if (whatsapp) payload.whatsapp_number = whatsapp;
    if (logoUrl) payload.logo_url = logoUrl;

    const save = await supabaseClient
      .from("site_settings")
      .upsert(payload);

    if (save.error) alert(save.error.message);
    else alert("Visual atualizado!");
  };
}

// =================================
// LOAD ORDERS
// =================================

async function loadOrders() {
  const { data } = await supabaseClient
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  const ordersList = document.getElementById("ordersList");
  if (!ordersList || !data) return;

  ordersList.innerHTML = "";

  data.forEach(o => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      Pedido #${o.id}<br>
      Total: R$ ${Number(o.total).toFixed(2)}<br>
      Status: ${o.status}
    `;

    ordersList.appendChild(div);
  });
}

loadOrders();

// =================================
// LOAD CUSTOMERS
// =================================

async function loadCustomers() {
  const { data } = await supabaseClient
    .from("customers")
    .select("*");

  const customersList = document.getElementById("customersList");
  if (!customersList || !data) return;

  customersList.innerHTML = "";

  data.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `${c.name}<br>${c.phone || ""}`;
    customersList.appendChild(div);
  });
}

loadCustomers();

// =================================
// CSV
// =================================

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

const downloadOrdersBtn = document.getElementById("downloadOrders");
if (downloadOrdersBtn) {
  downloadOrdersBtn.onclick = async () => {
    const { data } = await supabaseClient.from("orders").select("*");
    downloadCSV(data, "pedidos.csv");
  };
}

const downloadCustomersBtn = document.getElementById("downloadCustomers");
if (downloadCustomersBtn) {
  downloadCustomersBtn.onclick = async () => {
    const { data } = await supabaseClient.from("customers").select("*");
    downloadCSV(data, "clientes.csv");
  };
}
