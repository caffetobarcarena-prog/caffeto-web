import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://dzyqcvvrdfgtukkkdeql.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ======================
AUTH
====================== */

const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');

async function checkSession() {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
  }
}

checkSession();

loginBtn.onclick = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail.value,
    password: loginPassword.value
  });

  if (error) {
    loginMsg.innerText = error.message;
  } else {
    location.reload();
  }
};

window.logout = async () => {
  await supabase.auth.signOut();
  location.reload();
};

/* ======================
NAV
====================== */

window.showTab = tab => {
  ['products','settings','reports'].forEach(id =>
    document.getElementById(id).classList.add('hidden')
  );

  document.getElementById(tab).classList.remove('hidden');
};

/* ======================
PRODUCTS
====================== */

async function loadProducts() {
  const { data } = await supabase.from('products').select('*');

  const box = document.getElementById('productList');
  box.innerHTML = '';

  data.forEach(p => {
    const div = document.createElement('div');
    div.innerHTML = `
      ${p.name} — R$ ${p.price}
      <button onclick="toggleActive(${p.id},${!p.active})">
        ${p.active ? 'Desativar':'Ativar'}
      </button>
    `;
    box.appendChild(div);
  });
}

window.saveProduct = async () => {
  await supabase.from('products').insert({
    name: pname.value,
    price: pprice.value,
    active: true
  });

  loadProducts();
};

window.toggleActive = async (id,val) => {
  await supabase.from('products')
    .update({ active: val })
    .eq('id', id);

  loadProducts();
};

/* ======================
SETTINGS
====================== */

window.saveColor = async () => {
  await supabase.from('site_settings')
    .upsert({
      key:'main_color',
      value: colorInput.value
    });

  alert('Cor salva');
};

window.uploadLogo = async () => {
  const file = logoFile.files[0];
  if (!file) return;

  const path = `logo-${Date.now()}.png`;

  const { error } = await supabase.storage
    .from('site-assets')
    .upload(path, file, { upsert:true });

  if (error) {
    alert(error.message);
    return;
  }

  const { data } = supabase.storage
    .from('site-assets')
    .getPublicUrl(path);

  await supabase.from('site_settings')
    .upsert({
      key:'logo_url',
      value: data.publicUrl
    });

  alert('Logo atualizada');
};

/* ======================
REPORTS
====================== */

window.exportCSV = async () => {
  const { data } = await supabase
    .from('orders')
    .select('*');

  let csv = 'id,total,status,created_at\n';

  data.forEach(o => {
    csv += `${o.id},${o.total},${o.status},${o.created_at}\n`;
  });

  const blob = new Blob([csv], { type:'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pedidos.csv';
  a.click();
};

/* INIT */
loadProducts();
