document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById("email").value.trim();
    const passInput = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");
    const submitButton = loginForm.querySelector("button");

    if (errorMsg) {
      errorMsg.style.display = "none";
      errorMsg.innerText = "";
    }

    submitButton.disabled = true;
    submitButton.innerText = "Вхід...";

    try {
      const { error } = await window._supabase.auth.signInWithPassword({
        email: emailInput,
        password: passInput,
      });

      if (error) throw error;

      const profile = await window.getCurrentProfile();

      if (profile?.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    } catch (error) {
      console.error("Помилка входу:", error);

      if (errorMsg) {
        errorMsg.style.display = "block";
        errorMsg.innerText = "Невірний email або пароль.";
      }
    } finally {
      submitButton.disabled = false;
      submitButton.innerText = "Увійти";
    }
  });
});
