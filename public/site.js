import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase=createClient(
 "https://dzyqcvvrdfgtukkkdeql.supabase.co",
 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE"
);

loadVisual();
loadMenu();

async function loadVisual(){

 const {data:set}=await supabase.from("site_settings").select("*");
 set.forEach(s=>{
  if(s.key==="primary_color")
   document.documentElement.style.setProperty("--main",s.value);
  if(s.key==="headline") document.querySelector("header p").innerText=s.value;
 });

 const {data:assets}=await supabase.from("site_assets").select("*");

 assets.forEach(a=>{
  if(a.key==="logo")
   document.querySelector("h1").innerHTML=
    `<img src="${a.url}" height="50">`;
 });
}

async function loadMenu(){

 const {data}=await supabase
  .from("products")
  .select("*")
  .eq("available",true);

 menu.innerHTML="";

 data.forEach(p=>{
  menu.innerHTML+=`
   <div class="card">
    ${p.image_url?`<img src="${p.image_url}" width="100%">`:``}
    <strong>${p.name}</strong>
    <p>${p.description||""}</p>
    R$ ${p.price}
    <button onclick="add('${p.name}',${p.price})">Adicionar</button>
   </div>`;
 });
}
