import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* ================= CONFIG ================= */

const SUPABASE_URL = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const WHATSAPP_PHONE = "+5591993714865";
const MAPS_QUERY = "Caffeto Barcarena";

/* ========================================= */

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ================= STATE ================= */

let currentCustomer = null;
let cart = [];

/* ================= ELEMENTS ================= */

const menuEl = document.getElementById("menu");
const cartEl = document.getElementById("cart");
const whatsBtn = document.getElementById("whatsBtn");
const mapsBtn = document.getElementById("mapsBtn");
const pointsBox = document.getElementById("pointsBox");

const registerBtn = document.getElementById("registerBtn");
const customerInfo = document.getElementById("customerInfo");

const cname = document.getElementById("cname");
const cphone = document.getElementById("cphone");
const cemail = document.getElementById("cemail");
const cbirth = document.getElementById("cbirth");

/* ================= MAPS ================= */

mapsBtn.onclick = () => {
  window.open(
    `https://maps.google.com?q=${encodeURIComponent(MAPS_QUERY)}`
  );
};

/* ================= LOAD MENU ================= */

async function loadMenu() {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    alert("Erro ao carregar cardápio: " + error.message);
    console.error(error);
    return;
  }

  menuEl.innerHTML = "";

  data.forEach(p => {
    menuEl.innerHTML += `
      <div class="card">
        <strong>${p.name}</strong><br/>
        R$ ${Number(p.price).toFixed(2)}<br/>
        <button onclick="window.addToCart('${p.id}','${p.name}',${p.price})">
          Adicionar
        </button>
      </div>
    `;
  });
}

/* ================= CART ================= */

window.addToCart = (id, name, price) => {
  cart.push({ id, name, price });
  renderCart();
};

function renderCart() {
  cartEl.innerHTML = "";

  let total = 0;

  cart.forEach(i => {
    total += Number(i.price);
    cartEl.innerHTML += `<div>${i.name} — R$ ${i.price}</div>`;
  });

  cartEl.innerHTML += `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

/* ================= REGISTER / LOGIN ================= */

registerBtn.onclick = async () => {
  if (!cphone.value) {
    alert("Informe telefone.");
    return;
  }

  const { data: existing } = await supabase
    .from("customers")
    .select("*")
    .eq("phone", cphone.value)
    .maybeSingle();

  if (existing) {
    currentCustomer = existing;
    showCustomer(existing);
    return;
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: cname.value,
      phone: cphone.value,
      email: cemail.value,
      birthdate: cbirth.value
    })
    .select()
    .single();

  if (error) {
    alert("Erro cadastro: " + error.message);
    return;
  }

  currentCustomer = data;
  showCustomer(data);
};

function showCustomer(c) {
  customerInfo.innerHTML = `✔ Logado como <b>${c.name}</b>`;
  updatePoints();
}

/* ================= POINTS ================= */

async function updatePoints() {
  const { data } = await supabase
    .from("customers")
    .select("points")
    .eq("id", currentCustomer.id)
    .single();

  if (data) {
    pointsBox.innerHTML = `
      <strong>${data.points || 0}</strong> pontos
      <br><small>Resgate a partir de 1000 pontos</small>
    `;
  }
}

/* ================= WHATS ORDER ================= */

whatsBtn.onclick = async () => {
  if (!currentCustomer) {
    alert("Cadastre-se primeiro.");
    return;
  }

  if (!cart.length) {
    alert("Carrinho vazio.");
    return;
  }

  let total = cart.reduce((s,i)=>s+Number(i.price),0);

  const { error: orderError, data: order } = await supabase
    .from("orders")
    .insert({
      customer_id: currentCustomer.id,
      total,
      status: "novo"
    })
    .select()
    .single();

  if (orderError) {
    alert("Erro pedido: " + orderError.message);
    return;
  }

  const items = cart.map(i => ({
    order_id: order.id,
    product_id: i.id,
    price: i.price
  }));

  await supabase.from("order_items").insert(items);

  const points = Math.floor(total / 2);

  await supabase
    .from("customers")
    .update({
      points: (currentCustomer.points || 0) + points
    })
    .eq("id", currentCustomer.id);

  let msg = "Olá Caffeto! Quero fazer o pedido:%0A";

  cart.forEach(i => {
    msg += `- ${i.name} (R$ ${i.price})%0A`;
  });

  msg += `%0ATotal: R$ ${total.toFixed(2)}`;

  window.open(
    `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`
  );

  cart = [];
  renderCart();
  updatePoints();
};

/* ================= INIT ================= */

loadMenu();
