const supabaseUrl = "https://mgjtvqqsrcrmouffuijo.supabase.co";
const supabaseKey = "sb_publishable_R0I13hnrS3pt2hyG97xA9A_sQzPSsVD";

window.supabaseConfig = {
  url: supabaseUrl,
  key: supabaseKey,
};

if (window.supabase && !window._supabase) {
  window._supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
}

async function getCurrentProfile() {
  if (!window._supabase) return null;

  const {
    data: { user },
  } = await window._supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await window._supabase
    .from("profiles")
    .select("id,name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Помилка отримання профілю:", error);
  }

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.email,
    role: profile?.role || "user",
  };
}

window.getCurrentProfile = getCurrentProfile;

async function renderHeader() {
  const header = document.getElementById("main-header");
  if (!header) return;

  const user = await getCurrentProfile();

  header.innerHTML = `
        <div class="logo">
            <img src="logo.png" alt="Лого">
            <span>Березівська молодь</span>
        </div>
        <input type="checkbox" id="menu-toggle" class="menu-toggle">
        <label for="menu-toggle" class="burger">☰</label>
        <nav id="nav-menu">
            <a href="index.html">Про нас</a>
            <a href="reports.html">Звіти</a>
            <a href="contacts.html">Контакти</a>
            ${user && user.role === "admin" ? '<a href="admin.html">Адмінка</a>' : ""}
            ${user ? '<a href="#" onclick="logout()">Вихід</a>' : '<a href="login.html">Вхід</a>'}
        </nav>
        <label for="menu-toggle" class="overlay"></label>
    `;
}

async function logout() {
  if (window._supabase) {
    await window._supabase.auth.signOut();
  }

  window.location.href = "index.html";
}

window.logout = logout;

document.addEventListener("DOMContentLoaded", renderHeader);
