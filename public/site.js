import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://dzyqcvvrdfgtukkkdeql.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE'
);

const menuEl = document.getElementById('menu');
const cartEl = document.getElementById('cart');
const whatsBtn = document.getElementById('whatsBtn');

let cart = [];

// =============================
// SETTINGS
// =============================

const { data: settings } = await supabase
  .from('site_settings')
  .select('*')
  .single();

if (settings) {
  if (settings.main_color)
    document.documentElement.style.setProperty('--main-color', settings.main_color);

  if (settings.logo_url)
    document.getElementById('logo').src = settings.logo_url;
}

// =============================
// MENU
// =============================

const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('active', true);

products.forEach(p => {
  const div = document.createElement('div');
  div.className = 'card';

  div.innerHTML = `
    ${p.image_url ? `<img src="${p.image_url}" style="width:100%">` : ''}
    <strong>${p.name}</strong><br>
    R$ ${p.price}
    <br>
    <button>Adicionar</button>
  `;

  div.querySelector('button').onclick = () => {
    cart.push(p);
    renderCart();
  };

  menuEl.appendChild(div);
});

function renderCart() {
  cartEl.innerHTML = '';
  let total = 0;

  cart.forEach(i => {
    total += Number(i.price);
    cartEl.innerHTML += `<div>${i.name} — R$ ${i.price}</div>`;
  });

  cartEl.innerHTML += `<strong>Total: R$ ${total}</strong>`;
}

whatsBtn.onclick = () => {
  let msg = 'Pedido Caffeto:%0A';
  cart.forEach(i => msg += `- ${i.name}%0A`);

  window.open(
    `https://wa.me/5591993714865?text=${msg}`
  );
};
