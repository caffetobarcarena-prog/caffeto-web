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
  cart
