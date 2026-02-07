const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ================= SETTINGS =================

async function saveSettings(color, whatsapp, logoUrl){

  const payload = {
    key: 'main',
    main_color: color,
    whatsapp_number: whatsapp
  };

  if(logoUrl) payload.logo_url = logoUrl;

  const { error } = await supabaseClient
    .from('site_settings')
    .upsert(payload,{onConflict:'key'});

  if(error) alert(error.message);
  else alert('Visual atualizado!');
}

// ================= LOAD SETTINGS =================

async function loadSettings(){

  const { data } = await supabaseClient
    .from('site_settings')
    .select('*')
    .eq('key','main')
    .maybeSingle();

  if(!data) return;

  mainColor.value = data.main_color || '#314134';
  whatsappInput.value = data.whatsapp_number || '';
}

// ================= PRODUCTS =================

async function loadProducts(){

  const { data } = await supabaseClient
    .from('products')
    .select('*')
    .order('name');

  productList.innerHTML='';

  data.forEach(p=>{
    const div=document.createElement('div');
    div.className='menu-item';

    div.innerHTML=`
      ${p.image_url ? `<img src="${p.image_url}">` : ''}
      <b>${p.name}</b>
      R$ ${p.price}
    `;

    productList.appendChild(div);
  });
}

// ================= INIT =================

loadSettings();
loadProducts();
