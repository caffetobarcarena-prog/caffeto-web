import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/* =============================
   CONFIG
============================= */

const SUPABASE_URL = 'https://dzyqcvvrdfgtukkkdeql.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const WHATSAPP_PHONE = '5591993714865';
const MAPS_QUERY = 'Caffeto Barcarena';

/* =============================
   GLOBAL
============================= */

let currentCustomer = null;
let cart = [];

/* =============================
   LOAD SITE SETTINGS
============================= */

async function loadSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*');

  if (error) {
    console.error('Erro settings:', error);
    return;
  }

  data.forEach(s => {
    if (s.key === 'main_color') {
      document.documentElement.style.setProperty(
        '--main-color',
        s.value
      );
    }

    if (s.key === 'logo_url') {
      const header = document.querySelector('header');

      let img = header.querySelector('img');

      if (!img) {
        img = document.createElement('img');
        img.style.marginBottom = '10px';
        header.prepend(img);
      }

      img.src = s.value;
    }
  });
}

/* =============================
   LOAD MENU
============================= */

async function loadMenu() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error('Erro menu:', error);
    return;
  }

  const el = document.getElementById('menu');
  el.innerHTML = '';

  data.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';

    div.innerHTML = `
      <strong>${p.name}</strong><br/>
      R$ ${Number(p.price).toFixed(2)}<br/>
      <button data-id="${p.id}">Adicionar</button>
    `;

    div.querySelector('button').onclick = () =>
      addToCart(p);

    el.appendChild(div);
  });
}

/* =============================
   CART
============================= */

function addToCart(product) {
  cart.push(product);
  renderCart();
}

function renderCart() {
  const el = document.getElementById('cart');
  el.innerHTML = '';

  let total = 0;

  cart.forEach(i => {
    total += Number(i.price);
    el.innerHTML += `<div>${i.name} — R$ ${i.price}</div>`;
  });

  el.innerHTML += `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

/* =============================
   WHATSAPP
============================= */

async function sendWhats() {
  if (!cart.length || !currentCustomer) {
    alert('Cadastre-se e escolha itens.');
    return;
  }

  const total = cart.reduce(
    (s, i) => s + Number(i.price),
    0
  );

  let msg = 'Olá Caffeto! Pedido:%0A';

  cart.forEach(i => {
    msg += `- ${i.name} (R$ ${i.price})%0A`;
  });

  msg += `%0ATotal: R$ ${total.toFixed(2)}`;

  window.open(
    `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`
  );
}

/* =============================
   CUSTOMER REGISTER
============================= */

async function registerCustomer() {
  const payload = {
    name: cname.value,
    phone: cphone.value,
    email: cemail.value,
    birth_date: cbirth.value,
  };

  let { data } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', payload.phone)
    .single();

  if (!data) {
    const res = await supabase
      .from('customers')
      .insert(payload)
      .select()
      .single();

    data = res.data;
  }

  currentCustomer = data;

  customerInfo.innerHTML =
    `Olá, ${data.name}!`;

  loadPoints();
}

/* =============================
   POINTS
============================= */

async function loadPoints() {
  const { data } = await supabase
    .from('loyalty_points')
    .select('points')
    .eq('customer_id', currentCustomer.id)
    .single();

  pointsBox.innerText =
    data
      ? `Você tem ${data.points} pontos`
      : '0 pontos';
}

/* =============================
   MAPS
============================= */

function openMaps() {
  window.open(
    `https://maps.google.com?q=${encodeURIComponent(MAPS_QUERY)}`
  );
}

/* =============================
   INIT
============================= */

document
  .getElementById('registerBtn')
  .onclick = registerCustomer;

document
  .getElementById('whatsBtn')
  .onclick = sendWhats;

document
  .getElementById('mapsBtn')
  .onclick = openMaps;

loadSettings();
loadMenu();
