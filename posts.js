import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://mgjtvqqsrcrmouffuijo.supabase.co";
const supabaseKey = "sb_publishable_R0I13hnrS3pt2hyG97xA9A_sQzPSsVD";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  loadPostsFromSupabase();
});

async function loadPostsFromSupabase() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = "<p>Завантаження звітів...</p>";

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("id", { ascending: false }); // Спочатку нові

    if (error) throw error;

    container.innerHTML = "";

    if (!posts || posts.length === 0) {
      container.innerHTML = "<p>Наразі публікацій немає.</p>";
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
                <img src="${post.image}" alt="${post.title}" onerror="this.src='./assets/default.jpg'">
                <div class="post-info">
                    <h3>${post.title}</h3>
                    <p><strong>${post.category}</strong></p>
                    <p>${post.description}</p>
                </div>
            `;
      container.innerHTML += card.outerHTML;
    });
  } catch (error) {
    console.error("Помилка Supabase:", error);
    container.innerHTML = `<p style="color: red;">Не вдалося завантажити дані: ${error.message}</p>`;
  }
}

const searchBar = document.getElementById("searchBar");
if (searchBar) {
  searchBar.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();

    // Можна фільтрувати вже завантажені дані або робити новий запит (простіший варіант - фільтрація)
    const cards = document.querySelectorAll(".post-card");
    cards.forEach((card) => {
      const title = card.querySelector("h3").innerText.toLowerCase();
      const category = card.querySelector("strong").innerText.toLowerCase();
      if (title.includes(query) || category.includes(query)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}
