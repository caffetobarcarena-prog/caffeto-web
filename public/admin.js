/* ================= ADMIN PANEL CAFFETO ================= */

const SUPABASE_URL = "COLE_SUA_URL";
const SUPABASE_KEY = "COLE_SUA_ANON_KEY";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* ---------- LOGIN ---------- */

async function loginAdmin() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Erro: " + error.message);
  } else {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    loadProducts();
    loadLoyalty();
  }
}

/* ---------- PRODUTOS ---------- */

async function loadProducts() {
  const { data } = await supabase.from("products").select("*");

  const list = document.getElementById("productsList");
  list.innerHTML = "";

  data.forEach(p => {
    list.innerHTML += `
      <div>
        ${p.name} - R$ ${p.price}
        <button onclick="deleteProduct('${p.id}')">Excluir</button>
      </div>
    `;
  });
}

async function addProduct() {
  const name = document.getElementById("pname").value;
  const price = document.getElementById("pprice").value;

  await supabase.from("products").insert({
    name,
    price
  });

  loadProducts();
}

/* ---------- FIDELIDADE ---------- */

async function loadLoyalty() {
  const { data } = await supabase.from("loyalty").select("*");

  const list = document.getElementById("loyaltyList");
  list.innerHTML = "";

  data.forEach(l => {
    list.innerHTML += `
      <div>
        ${l.name} - ${l.phone} - ${l.points || 0} pts
      </div>
    `;
  });
}

/* ---------- EXPORTAR ---------- */

async function exportLoyaltyCSV() {
  const { data } = await supabase.from("loyalty").select("*");

  let csv = "Nome,Telefone,Email,Pontos\n";

  data.forEach(l => {
    csv += `${l.name},${l.phone},${l.email},${l.points}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "fidelidade.csv";
  a.click();
}
