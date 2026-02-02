import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL="https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);

const WHATSAPP_PHONE="+5591993714865";
const MAPS_QUERY="Caffeto Barcarena";

let cart=[];
let currentCustomer=null;

mapsBtn.onclick=()=>window.open(`https://maps.google.com?q=${encodeURIComponent(MAPS_QUERY)}`);
registerBtn.onclick=registerCustomer;
whatsBtn.onclick=finalizeOrder;

async function registerCustomer(){

 const payload={
  name:cname.value,
  phone:cphone.value,
  email:cemail.value,
  birth:cbirth.value
 };

 const { data,error }=await supabase
  .from("customers")
  .upsert(payload,{onConflict:"phone"})
  .select()
  .single();

 if(error) return alert(error.message);

 currentCustomer=data;
 customerInfo.innerText=`Olá ${data.name}`;
 loadPoints();
 loadMenu();
}

async function loadPoints(){
 const { data }=await supabase
  .from("customers")
  .select("points")
  .eq("id",currentCustomer.id)
  .single();

 pointsBox.innerText=`Pontos: ${data.points}`;
}

async function loadMenu(){

 const { data,error }=await supabase
  .from("products")
  .select("*")
  .eq("available",true);

 if(error) return console.error(error);

 menu.innerHTML="";
 data.forEach(p=>{
  menu.innerHTML+=`
   <div class="card">
    <strong>${p.name}</strong><br>
    R$ ${p.price}
    <button onclick="addToCart('${p.name}',${p.price})">Adicionar</button>
   </div>`;
 });
}

window.addToCart=(n,p)=>{
 cart.push({name:n,price:p});
 renderCart();
};

function renderCart(){
 let total=cart.reduce((s,i)=>s+i.price,0);
 cartDiv.innerHTML=cart.map(i=>`${i.name} - ${i.price}`).join("<br>");
 cartDiv.innerHTML+=`<br><strong>Total: ${total}</strong>`;
}

async function finalizeOrder(){

 if(!currentCustomer||!cart.length)
  return alert("Cadastre-se e adicione itens");

 const total=cart.reduce((s,i)=>s+i.price,0);

 const { data,error }=await supabase
  .from("orders")
  .insert({
    customer_id:currentCustomer.id,
    total,
    status:"pending"
  })
  .select()
  .single();

 if(error) return alert(error.message);

 let msg="Olá Caffeto! Pedido:%0A";
 cart.forEach(i=>msg+=`- ${i.name} R$ ${i.price}%0A`);
 msg+=`Total: R$ ${total}`;

 window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${msg}`);

 cart=[];
 renderCart();
}

loadMenu();
