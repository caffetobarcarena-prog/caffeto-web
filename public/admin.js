import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* =============================
   CONFIG
============================= */

const SUPABASE_URL = "https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =============================
   ELEMENTOS
============================= */

const loginBox = document.getElementById("loginBox");
const panelBox = document.getElementById("panelBox");

const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

const bannerTextInput = document.getElementById("bannerText");
const bannerToggle = document.getElementById("bannerActive");
const bannerFile = document.getElementById("bannerFile");
const bannerSaveBtn = document.getElementById("saveBanner");

const bannerPreview = document.getElementById("bannerPreview");

/* =============================
   LOGIN ADMIN
============================= */

loginBtn.onclick = async () => {

  const email = emailInput.value;
  const password = passInput.value;

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    alert("Login inválido");
    return;
  }

  loginBox.style.display = "none";
  panelBox.style.display = "block";

  loadBanner();
};

/* =============================
   LOAD BANNER
============================= */

async function loadBanner() {

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .in("key", ["banner_text", "banner_active"]);

  data?.forEach(s => {

    if (s.key === "banner_text")
      bannerTextInput.value = s.value;

    if (s.key === "banner_active")
      bannerToggle.checked = s.value === "true";

  });

  const { data: asset } = await supabase
    .from("site_assets")
    .select("*")
    .eq("key", "banner")
    .single();

  if (asset?.url)
    bannerPreview.src = asset.url;
}

/* =============================
   SAVE BANNER
============================= */

bannerSaveBtn.onclick = async () => {

  const text = bannerTextInput.value;
  const active = bannerToggle.checked;

  await supabase.from("site_settings")
    .upsert([
      { key: "banner_text", value: text },
      { key: "banner_active", value: active.toString() }
    ], { onConflict: "key" });

  if (bannerFile.files[0]) {

    const file = bannerFile.files[0];

    const path =
      `assets/banner-${Date.now()}.${file.name.split(".").pop()}`;

    const { error } = await supabase.storage
      .from("site")
      .upload(path, file, { upsert: true });

    if (!error) {

      const { data } = supabase.storage
        .from("site")
        .getPublicUrl(path);

      await supabase.from("site_assets")
        .upsert({
          key: "banner",
          url: data.publicUrl
        }, { onConflict: "key" });

    }

  }

  alert("Banner atualizado!");
};
