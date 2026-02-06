import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* =============================
   CONFIG
============================= */

const SUPABASE_URL = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const WHATSAPP_PHONE = "5591993714865";
const MAPS_QUERY = "Caffeto Barcarena";

/* =============================
   CLIENT
============================= */

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =============================
   ELEMENTOS
============================= */

const header = document.querySelector("header");
const titleEl = document.querySelector("header h1");
const subtitleEl = document.querySelector("header p");

const menuEl = document.getElementById("menu");
const cartEl = document.getElementById("cart");

const pointsBox = document.getElementById("pointsBox");
const mapsBtn = document.getElementById("mapsBtn");
const whatsBtn = document.getElementById("whatsBtn");

const registerBtn = document.getElementById("registerBtn");

/* =============================
   STATE
============================= */

let cart = [];
let customer = null;

/* =============================
   INIT
============================= */

init();

async function init() {
  await loadVisual();
  await loadMenu();
}

/* =============================
   VISUAL / CMS
============================= */

async function loadVisual() {

  const { data: settings, error } =
    await supabase.from("site_settings").select("*");

  if (error) {
    console.error("Erro site_settings:", error);
    return;
  }

  settings.forEach(s => {

    if (s.key === "primary_color") {
      document.documentElement
        .style.setProperty("--main-color", s.value);

      header.style.background = s.value;
    }

    if (s.key === "headline") {
      subtitleEl.innerText = s.value;
    }

  });

  const { data: assets, error: assetErr } =
    await supabase.from("site_assets").select("*");

  if (assetErr) {
    console.error("Erro site_assets:", assetErr);
    return;
  }

  assets.forEach(a => {

    if (a.key === "logo") {

      titleEl.innerHTML =
        `<img src="${a.url}" alt="Caffeto">`;

    }

  });

}

/* =============================
   CARDÁPIO
============================= */

async function loadMenu() {

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("available", true);

  if (error) {
    console.error("Erro cardápio:", error);
    return;
  }

  menuEl.innerHTML = "";

  data.forEach(p => {

    menuEl.innerHTML += `
      <div class="card">
        ${p.image_url ? `<img src="${p.image_url}" width="100%">` : ""}
        <strong>${p.name}</strong>
        <p>${p.description || ""}</p>
        <p>R$ ${Number(p.price).toFixed(2)}</p>
        <button onclick="addToCart('${p.name}', ${p.price})">
          Adicionar
        </button>
      </div>
    `;

  });

}

/* =============================
   CARRINHO
============================= */

window.addToCart = (name, price) => {

  cart.push({ name, price });

  renderCart();
};

function renderCart() {

  cartEl.innerHTML = "";

  let total = 0;

  cart.forEach(i => {

    total += Number(i.price);

    cartEl.innerHTML +=
      `<div>${i.name} — R$ ${Number(i.price).toFixed(2)}</div>`;

  });

  cartEl.innerHTML +=
    `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

/* =============================
   MAPS
============================= */

mapsBtn.onclick = () => {

  window.open(
    `https://maps.google.com?q=${encodeURIComponent(MAPS_QUERY)}`
  );

};

/* =============================
   WHATSAPP
============================= */

whatsBtn.onclick = () => {

  if (!cart.length) {
    alert("Carrinho vazio");
    return;
  }

  let msg = "Olá Caffeto! Pedido:%0A";

  cart.forEach(i => {
    msg += `- ${i.name} (R$ ${i.price})%0A`;
  });

  const total = cart.reduce(
    (s, i) => s + Number(i.price), 0
  );

  msg += `%0ATotal: R$ ${total.toFixed(2)}`;

  window.open(
    `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`,
    "_blank"
  );

};

/* =============================
   CADASTRO CLIENTE
============================= */

registerBtn.onclick = async () => {

  const name = cname.value;
  const phone = cphone.value;
  const email = cemail.value;
  const birth = cbirth.value;

  if (!phone) {
    alert("Informe telefone");
    return;
  }

  const { data, error } = await supabase
    .from("customers")
    .upsert({
      name,
      phone,
      email,
      birth
    }, { onConflict: "phone" })
    .select()
    .single();

  if (error) {
    console.error("Erro cliente:", error);
    alert("Erro no cadastro");
    return;
  }

  customer = data;

  customerInfo.innerText =
    `Olá ${data.name}!`;

  loadPoints();
};

/* =============================
   PONTOS
============================= */

async function loadPoints() {

  if (!customer) return;

  const { data, error } = await supabase
    .from("loyalty_points")
    .select("points")
    .eq("customer_id", customer.id)
    .single();

  if (!error && data) {
    pointsBox.innerText =
      `Você tem ${data.points} pontos`;
  }

}
