import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dzyqcvvrdfgtukkkdeql.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE'
);

/* ======================
LOAD SETTINGS
====================== */

async function loadSettings(){
  const { data } = await supabase.from('site_settings').select('*');

  data.forEach(s=>{
    if(s.key==='main_color'){
      document.documentElement.style.setProperty('--main-color', s.value);
    }
    if(s.key==='logo_url' && s.value){
      document.getElementById('logo').src = s.value;
    }
  });
}

/* ======================
MENU
====================== */

async function loadMenu(){
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true);

  if(error){
    console.error('Erro menu:', error);
    return;
  }

  const el = document.getElementById('menu');
  el.innerHTML='';

  data.forEach(p=>{
    el.innerHTML += `
      <div class="card">
        ${p.image ? `<img src="${p.image}" style="width:100%;border-radius:10px">` : ''}
        <strong>${p.name}</strong><br>
        R$ ${p.price}
      </div>
    `;
  });
}

loadSettings();
loadMenu();
