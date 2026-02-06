import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://dzyqcvvrdfgtukkkdeql.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================
// SESSION CHECK
// ============================

async function checkSession() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    loginBox.classList.remove('hidden');
    adminPanel.classList.add('hidden');
  } else {
    loginBox.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadProducts();
  }
}

checkSession();

// ============================
// LOGIN
// ============================

loginBtn.onclick = async () => {

  const email = loginEmail.value;
  const password = loginPassword.value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMsg.innerText = error.message;
    return;
  }

  loginMsg.innerText = '';
  checkSession();
};

// ============================
// LOGOUT
// ============================

logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  location.reload();
};

// ============================
// PRODUCTS
// ============================

async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id');

  if (error) {
    alert(error.message);
    return;
  }

  productsList.innerHTML = '';

  data.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';

    div.innerHTML = `
      <strong>${p.name}</strong><br>
      R$ ${p.price}<br>
      ${p.image_url ? `<img src="${p.image_url}">` : ''}
    `;

    productsList.appendChild(div);
  });
}

// ============================
// SAVE PRODUCT + IMAGE
// ============================

saveProductBtn.onclick = async () => {

  const name = pname.value;
  const price = pprice.value;
  const file = pimage.files[0];

  let imageUrl = null;

  if (file) {

    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase
      .storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { data } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  const { error } = await supabase.from('products').insert({
    name,
    price,
    image_url: imageUrl,
    active: true
  });

  if (error) {
    alert(error.message);
    return;
  }

  pname.value = '';
  pprice.value = '';
  pimage.value = '';

  loadProducts();
};
