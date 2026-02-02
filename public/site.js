import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ================= CONFIG ====================

const SUPABASE_URL = "SUA_URL";
const SUPABASE_KEY = "SUA_ANON_KEY";

const MAPS_QUERY = "Caffeto Barcarena";
const WHATS_PHONE = "5591999999999";

// =============================================

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

let cart = [];
let currentCustomer = null;

// ================= INIT =====================

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("registerBtn").onclick = registerCustomer;
  document.getElementById("checkoutBtn").onclick = finalizeOrder;
  document.getElementById("whatsBtn").onclick = sendWhats;
  document.getElementById("mapsBtn").onclick = openMaps;

  loadMenu();
});

// ================= CLIENTE ===================

async function registerCustomer() {

  const name = cname.value.trim();
  const phone = cphone.value.trim();
  const email = cemail.value.trim();
  const birthdate = cbirth.value;

  if (!phone) {
    alert("Informe telefone.");
    return;
  }

  const { data: existing } = await sb
    .from("customers")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {

    currentCustomer = existing;

    customerInfo.innerHTML =
      `Olá ${existing.name}<br>Pontos: ${existing.points}`;

    pointsBox.innerHTML =
      `⭐ Pontos acumulados: ${existing.points}`;

    alert("Cadastro reconhecido 👍");
    return;
  }

  const { data, error } = await sb
    .from("customers")
    .insert({
      name,
      phone,
      email,
      birthdate
    })
    .select()
    .single();

  if (error) {
    alert("Erro cadastro: " + error.message);
    return;
  }

  currentCustomer = data;

  customerInfo.innerHTML =
    `Olá ${data.name}<br>Pontos: ${data.points}`;

  pointsBox.innerHTML =
    `⭐ Pontos acumulados: ${data.points}`;

  alert("Cadastro realizado 🎉");
}

// ================= CARDÁPIO ==================

async function loadMenu() {

  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("active", true);

  if (error) {
    alert("Erro cardápio: " + error.message);
    return;
  }

  const el = document.getElementById("menu");
  el.innerHTML = "";

  data.forEach(p => {
    el.innerHTML += `
      <div class="card">
        <strong>${p.name}</strong><br/>
        R$ ${Number(p.price).toFixed(2)}<br/>
        <button onclick="window.addToCart('${p.name}', ${p.price})">
          Adicionar
        </button>
      </div>
    `;
  });
}

// ================= CARRINHO ==================

window.addToCart = function(name, price) {
  cart.push({ name, price });
  renderCart();
};

function renderCart() {

  const el = document.getElementById("cart");
  el.innerHTML = "";

  let total = 0;

  cart.forEach(i => {
    total += Number(i.price);
    el.innerHTML += `<div>${i.name} — R$ ${i.price}</div>`;
  });

  el.innerHTML += `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

// ================= PEDIDO ====================

async function finalizeOrder() {

  if (!currentCustomer) {
    alert("Cadastre-se antes de pedir.");
    return;
  }

  if (!cart.length) {
    alert("Carrinho vazio.");
    return;
  }

  const total = cart.reduce((s,i)=>s+i.price,0);
  const points = Math.floor(total / 2);

  const { error } = await sb.from("orders").insert({
    customer_id: currentCustomer.id,
    items: cart,
    total,
    points_earned: points
  });

  if (error) {
    alert("Erro pedido: " + error.message);
    return;
  }

  currentCustomer.points += points;

  pointsBox.innerHTML =
    `⭐ Pontos acumulados: ${currentCustomer.points}`;

  alert(`Pedido salvo! +${points} pontos`);

  cart = [];
  renderCart();
}

// ================= WHATSAPP ==================

function sendWhats() {

  if (!cart.length) {
    alert("Carrinho vazio.");
    return;
  }

  let msg = "Olá Caffeto! Quero pedir:%0A";

  cart.forEach(i => {
    msg += `- ${i.name} (R$ ${i.price})%0A`;
  });

  const total = cart.reduce((s,i)=>s+i.price,0);

  msg += `%0ATotal: R$ ${total.toFixed(2)}`;

  window.open(
    `https://wa.me/${WHATS_PHONE}?text=${msg}`,
    "_blank"
  );
}

// ================= MAPS =====================

function openMaps() {
  window.open(
    `https://maps.google.com?q=${encodeURIComponent(MAPS_QUERY)}`
  );
}
