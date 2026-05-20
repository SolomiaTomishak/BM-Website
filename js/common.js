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
            <img src="../assets/logo.png" alt="Лого">
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

function renderFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  footer.innerHTML = `
        <div class="footer-inner">
            <div class="footer-brand">
                <img src="../assets/logo.png" alt="Лого Березівської молоді">
                <div>
                    <strong>Березівська молодь</strong>
                    <p>Разом творимо активну громаду.</p>
                </div>
            </div>
            <div class="footer-links" aria-label="Контакти та соцмережі">
                <a href="https://www.instagram.com/_berezivkayouth_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram Березівської молоді">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                        <circle cx="12" cy="12" r="4"></circle>
                        <circle cx="17.5" cy="6.5" r="1"></circle>
                    </svg>
                    <span>_berezivkayouth_</span>
                </a>
                <a href="https://www.facebook.com/search/top?q=%D0%91%D0%B5%D1%80%D0%B5%D0%B7%D1%96%D0%B2%D1%81%D1%8C%D0%BA%D0%B0%20%D0%9C%D0%BE%D0%BB%D0%BE%D0%B4%D1%8C" target="_blank" rel="noopener noreferrer" aria-label="Facebook Березівської молоді">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v5h4v-5h3l1-4h-4V9c0-.6.4-1 1-1z"></path>
                    </svg>
                    <span>Березівська Молодь</span>
                </a>
                <a href="mailto:berezivskamolod@gmail.com" aria-label="Написати на email Березівської молоді">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                        <path d="m4 7 8 6 8-6"></path>
                    </svg>
                    <span>berezivskamolod@gmail.com</span>
                </a>
            </div>
            <a class="support-button" href="https://send.monobank.ua/jar/24eJByXeQZ" target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M20.8 5.6c-1.8-1.8-4.8-1.8-6.6 0L12 7.8 9.8 5.6C8 3.8 5 3.8 3.2 5.6s-1.8 4.8 0 6.6L12 21l8.8-8.8c1.8-1.8 1.8-4.8 0-6.6z"></path>
                </svg>
                <span>Підтримати нас</span>
            </a>
        </div>
    `;
}

async function logout() {
  if (window._supabase) {
    await window._supabase.auth.signOut();
  }

  window.location.href = "index.html";
}

window.logout = logout;

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
});

