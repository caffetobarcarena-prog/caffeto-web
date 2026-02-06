import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dzyqcvvrdfgtukkkdeql.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE'
);

/* ================= AUTH ================= */

const loginSection=document.getElementById('loginSection');
const adminSection=document.getElementById('adminSection');

async function checkSession(){
  const { data } = await supabase.auth.getSession();
  if(data.session){
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    loadProducts();
  }
}
checkSession();

loginBtn.onclick = async ()=>{
  const { error } = await supabase.auth.signInWithPassword({
    email:loginEmail.value,
    password:loginPassword.value
  });
  if(!error) location.reload();
};

/* ================= LOGOUT ================= */

window.logout = async ()=>{
  await supabase.auth.signOut();
  location.reload();
};

/* ================= PRODUCTS ================= */

async function loadProducts(){
  const { data } = await supabase.from('products').select('*');

  const box=document.getElementById('productList');
  box.innerHTML='';

  data.forEach(p=>{
    box.innerHTML+=`
      <div>
        ${p.image?`<img src="${p.image}">`:''}
        ${p.name} - R$ ${p.price}
      </div>`;
  });
}

window.saveProduct = async ()=>{
  let imageUrl=null;

  const file=pimage.files[0];

  if(file){
    const path=`products/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('site-assets')
      .upload(path,file,{upsert:true});

    if(error) return alert(error.message);

    const { data } = supabase.storage
      .from('site-assets')
      .getPublicUrl(path);

    imageUrl=data.publicUrl;
  }

  await supabase.from('products').insert({
    name:pname.value,
    price:pprice.value,
    image:imageUrl,
    active:true
  });

  pname.value='';
  pprice.value='';
  pimage.value='';

  loadProducts();
};

/* ================= SETTINGS ================= */

window.saveColor = async ()=>{
  await supabase.from('site_settings')
    .upsert({ key:'main_color', value:colorInput.value });
  alert('Cor salva');
};

window.uploadLogo = async ()=>{
  const file=logoFile.files[0];
  if(!file) return;

  const path=`logo-${Date.now()}.png`;

  const { error } = await supabase.storage
    .from('site-assets')
    .upload(path,file,{upsert:true});

  if(error) return alert(error.message);

  const { data } = supabase.storage
    .from('site-assets')
    .getPublicUrl(path);

  await supabase.from('site_settings')
    .upsert({ key:'logo_url', value:data.publicUrl });

  alert('Logo atualizada');
};
