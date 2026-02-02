// ===============================
// CONFIGURAÇÕES SUPABASE
// ===============================

const SUPABASE_URL = "COLE_AQUI";
const SUPABASE_KEY = "COLE_AQUI";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let cart = [];
let WHATS = "";
let MAPS = "";

// ===============================
// CARREGAR CONFIGURAÇÕES DO SITE
// ===============================

async function loadSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*");

  if (error) {
    console.error("Erro settings:", error);
    return;
  }

  data.forEach(i => {
    if (i.key === "header_title")
      document.getElementById("headerTitle").innerText = i.value;

    if (i.key === "subtitle")
      document.getElementById("subtitle").innerText = i.value;

    if (i.key === "primary_color")
      document.documentElement.style.setProperty("--main", i.value);

    if (i.key === "whatsapp") WHATS = i.value;
    if (i.key === "maps_query") MAPS = i.value;
  });
}

// ===============================
// CARDÁPIO
// ===============================

async function loadMenu() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true);

  if (error) {
    console.error("Erro cardápio:", error);
    return;
  }

  const menu = document.getElementById("menu");
  menu.innerHTML = "";

  data.forEach(p => {
    menu.innerHTML += `
      <div class="card">
        <b>${p.name}</b><br>
        R$ ${Number(p.price).toFixed(2)}
        <br>
        <button onclick="addToCart('${p.name}',${p.price})">
          Adicionar
        </button>
      </div>
    `;
  });
}

// ===============================
// CARRINHO
// ===============================

function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
}

function renderCart() {
  const el = document.getElementById("cart");
  el.innerHTML = "";

  let total = 0;
  cart.forEach(i => {
    total += i.price;
    el.innerHTML += `<div>${i.name} — R$ ${i.price}</div>`;
  });

  el.innerHTML += `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

// ===============================
// ENVIAR PEDIDO + REGISTRAR
// ===============================

async function sendWhats() {
  if (!cart.length) {
    alert("Carrinho vazio");
    return;
  }

  const phoneInput = document.getElementById("lphone");
  const phone = phoneInput ? phoneInput.value : "";

  const total = cart.reduce((s, i) => s + i.price, 0);

  // grava pedido
  await supabase.from("orders").insert({
    phone,
    total,
    points_earned: Math.floor(total / 2)
  });

  let msg = "Pedido Caffeto:%0A";
  cart.forEach(i => {
    msg += `- ${i.name} (R$ ${i.price})%0A`;
  });

  msg += `%0ATotal: R$ ${total.toFixed(2)}`;

  window.open(`https://wa.me/${WHATS}?text=${msg}`);
}

// ===============================
// FIDELIDADE
// ===============================

async function saveLoyalty() {
  const name = document.getElementById("lname").value;
  const phone = document.getElementById("lphone").value;
  const email = document.getElementById("lemail").value;

  const { error } = await supabase.from("loyalty").upsert({
    phone,
    name,
    email
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Cadastro realizado!");
  }
}

// ===============================
// MAPS
// ===============================

function openMaps() {
  window.open(`https://maps.google.com?q=${MAPS}`);
}

// ===============================
// INIT
// ===============================

loadSettings();
loadMenu();
