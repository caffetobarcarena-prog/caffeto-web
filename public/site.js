import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://dzyqcvvrdfgtukkkdeql.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE"
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

/* =============================
   LOAD GLOBAL
============================= */

init();

async function init() {
  await loadVisual();
  await loadMenu();
}

/* =============================
   VISUAL DO SITE
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
        R$ ${p.price}
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

let cart = [];

window.addToCart = (name, price) => {
  cart.push({ name, price });
  renderCart();
};

function renderCart() {

  cartEl.innerHTML = "";

  let total = 0;

  cart.forEach(i => {
    total += Number(i.price);
    cartEl.innerHTML += `<div>${i.name} — R$ ${i.price}</div>`;
  });

  cartEl.innerHTML +=
    `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

/* =============================
   MAPS + WHATS
============================= */

mapsBtn.onclick = () => {
  window.open(
    `https://maps.google.com?q=Caffeto Barcarena`
  );
};

whatsBtn.onclick = () => {

  if (!cart.length) {
    alert("Carrinho vazio");
    return;
  }

  let msg = "Olá Caffeto! Pedido:%0A";

  cart.forEach(i => {
    msg += `- ${i.name} (R$ ${i.price})%0A`;
  });

  window.open(
    `https://wa.me/5591999999999?text=${msg}`
  );

};
