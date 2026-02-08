import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://dzyqcvvrdfgtukkkdeql.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE'
);

const menuEl = document.getElementById("menu");
const cartEl = document.getElementById("cart");
const whatsBtn = document.getElementById("whatsBtn");
const logoEl = document.getElementById("logo");

let cart = [];

// ================= SETTINGS =================

async function loadSettings() {

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key","main")
    .maybeSingle();

  if(!data) return;

  document.documentElement.style.setProperty("--main-color",data.main_color);

  if(data.logo_url){
    logoEl.src = data.logo_url;
  }
}

// ================= MENU =================

async function loadMenu() {

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("active",true)
    .order("name");

  menuEl.innerHTML="";

  data.forEach(p=>{

    const div=document.createElement("div");
    div.className="card";

    div.innerHTML=`
      ${p.image_url?`<img src="${p.image_url}">`:``}
      <b>${p.name}</b>
      <span>R$ ${Number(p.price).toFixed(2)}</span>
      <button>Adicionar</button>
    `;

    div.querySelector("button").onclick=()=>{
      cart.push(p);
      renderCart();
    };

    menuEl.appendChild(div);
  });
}

// ================= CART =================

function renderCart(){

  cartEl.innerHTML="";
  let total=0;

  cart.forEach(i=>{
    total+=Number(i.price);
    cartEl.innerHTML+=`<div>${i.name} — R$ ${i.price}</div>`;
  });

  cartEl.innerHTML+=`<b>Total: R$ ${total.toFixed(2)}</b>`;
}

// ================= WHATS =================

whatsBtn.onclick=()=>{

  if(!cart.length){
    alert("Carrinho vazio");
    return;
  }

  let msg="Pedido Caffeto:%0A%0A";

  cart.forEach(i=>{
    msg+=`- ${i.name}%0A`;
  });

  window.open(
    `https://wa.me/5591993714865?text=${msg}`,
    "_blank"
  );
};

// ================= INIT =================

await loadSettings();
await loadMenu();
