const users = [
  {
    id: "u1",
    name: "Адмін",
    email: "email@example.com",
    password: "пароль",
    role: "admin",
  },
  {
    id: "u2",
    name: "Користувач",
    email: "user@example.com",
    password: "123",
    role: "user",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("email").value.trim();
      const passInput = document.getElementById("password").value.trim();
      const errorMsg = document.getElementById("errorMsg");

      if (errorMsg) errorMsg.style.display = "none";

      // Пошук користувача у масиві
      const user = users.find(
        (u) => u.email === emailInput && u.password === passInput,
      );

      if (user) {
        // Зберігаємо дані в localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Перенаправлення залежно від ролі
        if (user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "index.html";
        }
      } else {
        if (errorMsg) {
          errorMsg.style.display = "block";
          errorMsg.innerText = "Невірний email або пароль!";
        }
      }
    });
  }
});
