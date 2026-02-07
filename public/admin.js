const supabaseUrl = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* =====================
 NAV
===================== */

document.querySelectorAll("nav button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

/* =====================
 AUTH CHECK
===================== */

supabase.auth.getSession().then(({ data }) => {
  if (!data.session) location.href = "/admin-login.html";
});

/* =====================
 IMAGE PREVIEW
===================== */

const prodImage = document.getElementById("prodImage");
const imagePreview = document.getElementById("imagePreview");

prodImage.onchange = e => {
  const file = e.target.files[0];
  if (file) imagePreview.src = URL.createObjectURL(file);
};

/* =====================
 LOAD PRODUCTS
===================== */

async function loadProducts() {
  const { data } = await supabase.from("products").select("*");
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

/* =====================
 SAVE PRODUCT
===================== */

document.getElementById("saveProduct").onclick = async () => {
  const name = prodName.value;
  const price = prodPrice.value;
  const file = prodImage.files[0];

  let imageUrl = null;

  if (file) {
    const path = `products/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file);

    if (error) return alert(error.message);

    imageUrl = supabase.storage
      .from("product-images")
      .getPublicUrl(path).data.publicUrl;
  }

  await supabase.from("products").insert({
    name,
    price,
    image_url: imageUrl
  });

  loadProducts();
};

/* =====================
 SAVE VISUAL
===================== */

document.getElementById("saveVisual").onclick = async () => {
  const color = mainColor.value;
  const file = logoFile.files[0];

  let logoUrl = null;

  if (file) {
    const path = `logo-${Date.now()}`;

    const { error } = await supabase.storage
      .from("site-assets")
      .upload(path, file);

    if (error) return alert(error.message);

    logoUrl = supabase.storage
      .from("site-assets")
      .getPublicUrl(path).data.publicUrl;
  }

  await supabase.from("site_settings").upsert({
    id: 1,
    main_color: color,
    logo_url: logoUrl
  });
};

/* =====================
 ORDERS
===================== */

async function loadOrders() {
  const { data } = await supabase.from("orders").select("*").order("id",{ascending:false});
  ordersList.innerHTML = JSON.stringify(data,null,2);
}

loadOrders();

/* =====================
 CUSTOMERS
===================== */

async function loadCustomers() {
  const { data } = await supabase.from("customers").select("*");
  customersList.innerHTML = JSON.stringify(data,null,2);
}

loadCustomers();
