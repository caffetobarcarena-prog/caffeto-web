import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const loginBox = document.getElementById("loginBox");
const panel = document.getElementById("adminPanel");

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  if (error) return alert(error.message);

  await checkAdmin();
};

async function checkAdmin() {
  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id",(await supabase.auth.getUser()).data.user.id)
    .maybeSingle();

  if (!data) return alert("Sem permissão.");

  loginBox.style.display="none";
  panel.style.display="block";

  loadSettings();
  loadProducts();
}

/* SETTINGS */

async function loadSettings(){
  const { data } = await supabase.from("settings").select("*").single();
  whatsapp.value=data.whatsapp;
  maps.value=data.maps_query;
  header.value=data.header_text;
  rate.value=data.point_rate;
}

saveSettings.onclick=async()=>{
 await supabase.from("settings").update({
  whatsapp:whatsapp.value,
  maps_query:maps.value,
  header_text:header.value,
  point_rate:rate.value
 }).neq("id","0");
};

/* PRODUCTS */

async function loadProducts(){
 const { data } = await supabase.from("products").select("*");
 products.innerHTML="";
 data.forEach(p=>{
  products.innerHTML+=`
   <div class="card">
    ${p.name} - ${p.price}
    <button onclick="window.toggle('${p.id}',${p.available})">
     ${p.available?'Desativar':'Ativar'}
    </button>
   </div>`;
 });
}

window.toggle=async(id,val)=>{
 await supabase.from("products")
 .update({available:!val})
 .eq("id",id);
 loadProducts();
};

addProduct.onclick=async()=>{
 const file=pimage.files[0];
 let img=null;

 if(file){
  const { data } = await supabase.storage
   .from("products")
   .upload(Date.now()+"-"+file.name,file);
  img=data.path;
 }

 await supabase.from("products").insert({
  name:pname.value,
  price:pprice.value,
  image:img,
  available:true
 });

 loadProducts();
};
