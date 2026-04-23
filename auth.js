const users = [
    { "id": "u1", "name": "Адмін", "email": "email@example.com", "password": "пароль", "role": "admin" },
    { "id": "u2", "name": "Користувач", "email": "user@example.com", "password": "123", "role": "user" }
];

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email').value;
        const passInput = document.getElementById('password').value;
        const errorMsg = document.getElementById('errorMsg');

        const user = users.find(u => u.email === emailInput && u.password === passInput);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = user.role === 'admin' ? 'admin.html' : 'index.html';
        } else {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "Помилка входу!";
        }
    });
}