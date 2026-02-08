const SUPABASE_URL = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ================= DOM =================

const mainColor=document.getElementById("mainColor");
const whatsappInput=document.getElementById("whatsappInput");
const logoFile=document.getElementById("logoFile");
const saveVisualBtn=document.getElementById("saveVisual");

const prodName=document.getElementById("prodName");
const prodPrice=document.getElementById("prodPrice");
const prodImage=document.getElementById("prodImage");
const saveProductBtn=document.getElementById("saveProduct");
const productList=document.getElementById("productList");

// ================= SETTINGS =================

async function loadSettings(){

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key","main")
    .maybeSingle();

  if(!data) return;

  mainColor.value=data.main_color;
  whatsappInput.value=data.whatsapp_number||"";

  document.documentElement.style.setProperty("--main",data.main_color);
}

async function saveSettings(){

  const payload={
    key:"main",
    main_color:mainColor.value,
    whatsapp_number:whatsappInput.value
  };

  if(logoFile.files[0]){

    const path="logo-"+Date.now();

    const upload=await supabase.storage
      .from("site-assets")
      .upload(path,logoFile.files[0],{upsert:true});

    if(upload.error) return alert(upload.error.message);

    payload.logo_url=
      supabase.storage.from("site-assets")
      .getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert(payload,{onConflict:"key"});

  if(error) alert(error.message);
  else alert("Visual atualizado!");
}

// ================= PRODUCTS =================

async function loadProducts(){

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("name");

  productList.innerHTML="";

  data.forEach(p=>{
    const div=document.createElement("div");
    div.className="menu-item";

    div.innerHTML=`
      ${p.image_url?`<img src="${p.image_url}">`:``}
      <b>${p.name}</b>
      <span>R$ ${p.price}</span>
    `;

    productList.appendChild(div);
  });
}

async function saveProduct(){

  if(!prodName.value||!prodPrice.value)
    return alert("Preencha tudo");

  let imageUrl=null;

  if(prodImage.files[0]){

    const path="products/"+Date.now()+"-"+prodImage.files[0].name;

    const upload=await supabase.storage
      .from("product-images")
      .upload(path,prodImage.files[0],{upsert:true});

    if(upload.error) return alert(upload.error.message);

    imageUrl=supabase.storage
      .from("product-images")
      .getPublicUrl(path).data.publicUrl;
  }

  await supabase.from("products").insert({
    name:prodName.value,
    price:prodPrice.value,
    image_url:imageUrl,
    active:true
  });

  prodName.value="";
  prodPrice.value="";
  prodImage.value="";

  loadProducts();
}

// ================= INIT =================

saveVisualBtn.onclick=saveSettings;
saveProductBtn.onclick=saveProduct;

loadSettings();
loadProducts();
