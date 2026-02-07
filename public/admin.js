// ==========================
// SUPABASE CONFIG
// ==========================

const supabaseUrl = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ==========================
// AUTH GUARD
// ==========================

(async () => {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    alert("Faça login novamente.");
    window.location.href = "/admin-login.html";
  }
})();

// ==========================
// NAV / TABS
// ==========================

document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    document.querySelectorAll("nav button").forEach(b =>
      b.classList.remove("active")
    );

    document.querySelectorAll("section").forEach(sec =>
      sec.classList.remove("active")
    );

    btn.classList.add("active");
    document.getElementById(tab).classList.add("active");
  });
});

// ==========================
// IMAGE PREVIEW
// ==========================

const prodImageInput = document.getElementById("prodImage");
const previewImg = document.getElementById("imagePreview");

prodImageInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  previewImg.src = URL.createObjectURL(file);
});

// ==========================
// LOAD PRODUCTS
// ==========================

async function loadProducts() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    alert("Erro menu: " + error.message);
    return;
  }

  const list = document.getElementById("productList");
  list.innerHTML = "";

  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <b>${p.name}</b><br>
      R$ ${p.price}<br>
      ${p.image_url ? `<img src="${p.image_url}" class="preview">` : ""}
    `;
    list.appendChild(div);
  });
}

loadProducts();

// ==========================
// SAVE PRODUCT
// ==========================

document.getElementById("saveProduct").addEventListener("click", async () => {
  const name = prodName.value.trim();
  const price = prodPrice.value;
  const file = prodImageInput.files[0];

  if (!name || !price) return alert("Nome e preço obrigatórios.");

  let imageUrl = null;

  if (file) {
    const path = `products/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (error) {
      alert("Erro upload: " + error.message);
      return;
    }

    imageUrl = supabase.storage
      .from("product-images")
      .getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from("products").insert({
    name,
    price,
    image_url: imageUrl,
    active: true
  });

  if (error) return alert(error.message);

  prodName.value = "";
  prodPrice.value = "";
  prodImageInput.value = "";
  previewImg.src = "";

  loadProducts();
});

// ==========================
// SAVE VISUAL
// ==========================

document.getElementById("saveVisual").addEventListener("click", async () => {
  const color = mainColor.value;
  const file = logoFile.files[0];

  let logoUrl = null;

  if (file) {
    const path = `logo-${Date.now()}`;

    const { error } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { upsert: true });

    if (error) {
      alert("Erro logo: " + error.message);
      return;
    }

    logoUrl = supabase.storage
      .from("site-assets")
      .getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    main_color: color,
    logo_url: logoUrl
  });

  if (error) alert(error.message);
  else alert("Visual atualizado!");
});

// ==========================
// LOAD ORDERS
// ==========================

async function loadOrders() {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  ordersList.innerHTML = "";

  data.forEach(o => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      Pedido #${o.id}<br>
      Total: R$ ${o.total}<br>
      Status: ${o.status}
    `;
    ordersList.appendChild(div);
  });
}

// ==========================
// LOAD CUSTOMERS
// ==========================

async function loadCustomers() {
  const { data } = await supabase.from("customers").select("*");

  customersList.innerHTML = "";

  data.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      ${c.name}<br>
      ${c.phone || ""}
    `;
    customersList.appendChild(div);
  });
}

loadOrders();
loadCustomers();
