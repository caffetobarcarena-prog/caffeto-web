import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase=createClient(
 "https://dzyqcvvrdfgtukkkdeql.supabase.co",
 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE"
);

const bucket="site";

/* -------- SETTINGS -------- */

loadSettings();

async function loadSettings(){
 const {data}=await supabase.from("site_settings").select("*");
 data.forEach(s=>{
  const el=document.getElementById(s.key);
  if(el) el.value=s.value;
 });
}

window.saveSettings=async()=>{
 const items=[
  headline.value,
  subheadline.value,
  primary_color.value,
  whatsapp.value,
  maps.value
 ];

 const keys=["headline","subheadline","primary_color","whatsapp","maps"];

 for(let i=0;i<keys.length;i++){
  await supabase.from("site_settings")
   .upsert({key:keys[i],value:items[i]});
 }
 alert("Salvo!");
};

/* -------- PRODUCTS -------- */

loadProducts();

async function loadProducts(){
 const {data}=await supabase.from("products").select("*");
 products.innerHTML="";
 data.forEach(p=>{
  products.innerHTML+=`
   <div>
    <strong>${p.name}</strong> - ${p.price}
    <button onclick="toggle('${p.id}',${!p.available})">
      ${p.available?"Desativar":"Ativar"}
    </button>
   </div>`;
 });
}

window.toggle=async(id,val)=>{
 await supabase.from("products")
  .update({available:val})
  .eq("id",id);
 loadProducts();
};

window.saveProduct=async()=>{
 let imgUrl=null;

 if(pimg.files[0]){
  const path=`products/${Date.now()}-${pimg.files[0].name}`;

  await supabase.storage
   .from(bucket)
   .upload(path,pimg.files[0]);

  imgUrl=supabase.storage
   .from(bucket)
   .getPublicUrl(path).data.publicUrl;
 }

 await supabase.from("products").insert({
  name:pname.value,
  description:pdesc.value,
  price:pprice.value,
  image_url:imgUrl
 });

 alert("Produto salvo!");
 loadProducts();
};

/* -------- ASSETS -------- */

window.uploadAsset=async()=>{

 const file=assetFile.files[0];
 if(!file) return;

 const path=`assets/${assetKey.value}-${Date.now()}`;

 await supabase.storage.from(bucket).upload(path,file);

 const url=supabase.storage.from(bucket)
  .getPublicUrl(path).data.publicUrl;

 await supabase.from("site_assets")
  .upsert({key:assetKey.value,url});

 alert("Imagem salva!");
};
