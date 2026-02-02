// ================= IMPORT SDK =================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ================= CONFIG ====================

const SUPABASE_URL = "COLE_AQUI";
const SUPABASE_KEY = "COLE_AQUI";

const MAPS_QUERY = "Caffeto Barcarena";

// =============================================

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= VARIÁVEIS =================

let cart = [];
let currentCustomer = null;

// ================= CLIENTE ===================

document.getElementById("registerBtn").onclick = registerCustomer;
document.getElementById("checkoutBtn").onclick = finalizeOrder;
document.getElementById("mapsBtn").onclick = openMaps;

// ================= FUNÇÕES ===================

async function registerCustomer() {

  const name = cname.value;
  const phone = cphone.value;
  const email = cemail.value;
  const birthdate = cbirth.value;

  const { data, error } = await sb
    .from("customers")
    .upsert({
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
        R$ ${p.price}<br/>
        <button onclick="addToCart('${p.name}', ${p.price})">
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
    alert("Faça cadastro antes de pedir.");
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

  alert(`Pedido enviado! Você ganhou ${points} pontos`);

  cart = [];
  renderCart();

  currentCustomer.points += points;

  pointsBox.innerHTML =
    `⭐ Pontos acumulados: ${currentCustomer.points}`;
}

// ================= MAPS =====================

function openMaps() {
  window.open(
    `https://maps.google.com?q=${encodeURIComponent(MAPS_QUERY)}`
  );
}

// ================= INIT =====================

loadMenu();
