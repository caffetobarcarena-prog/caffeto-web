// ================================
// SUPABASE CONFIG
// ================================

const SUPABASE_URL = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

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
  var buttons = document.querySelectorAll("nav button");
  var tabs = document.querySelectorAll(".tab");

  buttons.forEach(function (btn) {
    btn.onclick = function () {
      var tab = btn.dataset.tab;

      buttons.forEach(function (b) {
        b.classList.remove("active");
      });

      tabs.forEach(function (t) {
        t.classList.remove("active");
      });

      btn.classList.add("active");
      document.getElementById(tab).classList.add("active");
    };
  });
}

initTabs();

// ================================
// PRODUCT IMAGE PREVIEW
// ================================

var prodImageInput = document.getElementById("prodImage");
var previewImg = document.getElementById("imagePreview");

if (prodImageInput) {
  prodImageInput.onchange = function (e) {
    var file = e.target.files[0];
    if (!file) return;

    previewImg.src = URL.createObjectURL(file);
  };
}

// ================================
// LOAD PRODUCTS
// ================================

async function loadProducts() {
  const result = await supabaseClient
    .from("products")
    .select("*")
    .order("id");

  if (result.error) {
    alert("Erro menu: " + result.error.message);
    return;
  }

  var list = document.getElementById("productList");
  list.innerHTML = "";

  result.data.forEach(function (p) {
    var div = document.createElement("div");
    div.className = "card";

    div.innerHTML =
      "<strong>" +
      p.name +
      "</strong><br>R$ " +
      p.price +
      "<br>" +
      (p.image_url
        ? '<img src="' + p.image_url + '" class="preview">'
        : "");

    list.appendChild(div);
  });
}

loadProducts();

// ================================
// SAVE PRODUCT
// ================================

var saveProductBtn = document.getElementById("saveProduct");

if (saveProductBtn) {
  saveProductBtn.onclick = async function () {
    var name = prodName.value.trim();
    var price = prodPrice.value;
    var file = prodImageInput.files[0];

    if (!name || !price) {
      alert("Nome e preço obrigatórios.");
      return;
    }

    var imageUrl = null;

    if (file) {
      var path = "products/" + Date.now() + "-" + file.name;

      var upload = await supabaseClient.storage
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

    var insert = await supabaseClient.from("products").insert({
      name: name,
      price: price,
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
// VISUAL SETTINGS
// ================================

var saveVisualBtn = document.getElementById("saveVisual");

if (saveVisualBtn) {
  saveVisualBtn.onclick = async function () {
    var color = mainColor.value;
    var whatsapp = whatsappInput.value;
    var file = logoFile.files[0];

    var logoUrl = null;

    if (file) {
      var path = "logo-" + Date.now();

      var upload = await supabaseClient.storage
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

    var payload = {
      id: 1,
      main_color: color,
      whatsapp_number: whatsapp
    };

    if (logoUrl) payload.logo_url = logoUrl;

    var save = await supabaseClient.from("site_settings").upsert(payload);

    if (save.error) alert(save.error.message);
    else alert("Visual atualizado!");
  };
}

// ================================
// LOAD ORDERS
// ================================

async function loadOrders() {
  var res = await supabaseClient
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  var ordersList = document.getElementById("ordersList");
  if (!ordersList) return;

  ordersList.innerHTML = "";

  res.data.forEach(function (o) {
    var div = document.createElement("div");
    div.className = "card";

    div.innerHTML =
      "Pedido #" +
      o.id +
      "<br>Total: R$ " +
      o.total +
      "<br>Status: " +
      o.status;

    ordersList.appendChild(div);
  });
}

loadOrders();

// ================================
// LOAD CUSTOMERS
// ================================

async function loadCustomers() {
  var res = await supabaseClient.from("customers").select("*");

  var customersList = document.getElementById("customersList");
  if (!customersList) return;

  customersList.innerHTML = "";

  res.data.forEach(function (c) {
    var div = document.createElement("div");
    div.className = "card";

    div.innerHTML = c.name + "<br>" + (c.phone || "");

    customersList.appendChild(div);
  });
}

loadCustomers();

// ================================
// DOWNLOAD CSV
// ================================

function downloadCSV(rows, filename) {
  if (!rows || !rows.length) return;

  var header = Object.keys(rows[0]).join(",");
  var csv =
    header +
    "\n" +
    rows.map(function (r) {
      return Object.values(r).join(",");
    }).join("\n");

  var blob = new Blob([csv], { type: "text/csv" });
  var link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

var downloadOrdersBtn = document.getElementById("downloadOrders");
if (downloadOrdersBtn) {
  downloadOrdersBtn.onclick = async function () {
    var res = await supabaseClient.from("orders").select("*");
    downloadCSV(res.data, "pedidos.csv");
  };
}

var downloadCustomersBtn = document.getElementById("downloadCustomers");
if (downloadCustomersBtn) {
  downloadCustomersBtn.onclick = async function () {
    var res = await supabaseClient.from("customers").select("*");
    downloadCSV(res.data, "clientes.csv");
  };
}
