const SUPABASE_URL = 'https://mgjtvqqsrcrmouffuijo.supabase.co/rest/v1/'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nanR2cXFzcmNybW91ZmZ1aWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzQyMzAsImV4cCI6MjA5MjI1MDIzMH0.z173ECMcwPDZEP5fNVlvdm-B1v1SgXawa2o4koAoQqk';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
function renderHeader() {
    const header = document.getElementById('main-header');
    const user = JSON.parse(localStorage.getItem('currentUser'));

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
            ${user && user.role === 'admin' ? '<a href="admin.html">Адмінка</a>' : ''}
            ${user ? '<a href="#" onclick="logout()">Вихід</a>' : '<a href="login.html">Вхід</a>'}
        </nav>
        <label for="menu-toggle" class="overlay"></label>
    `;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', renderHeader);