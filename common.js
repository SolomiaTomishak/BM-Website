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