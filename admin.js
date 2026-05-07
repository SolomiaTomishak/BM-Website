document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
    return;
  }
  loadAdminPosts();
});

async function loadAdminPosts() {
  const listContainer = document.getElementById("adminPostsList");
  if (!listContainer) return;

  const { data: posts, error } = await _supabase
    .from("posts")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Помилка отримання постів:", error);
    return;
  }

  listContainer.innerHTML = "<h3>Список публікацій</h3>";
  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "admin-post-card";
    div.innerHTML = `
            <div class="admin-post-info">
                <h4>${post.title}</h4>
                <p><small>${post.category}</small></p>
            </div>
            <div class="admin-actions">
                <button class="edit-btn" onclick='openEditModal(${JSON.stringify(post)})'>Редагувати</button>
                <button class="delete-btn" onclick="deletePost(${post.id})">Видалити</button>
            </div>
        `;
    listContainer.appendChild(div);
  });
}

const addPostForm = document.getElementById("addPostForm");
const submitBtn = document.getElementById("submitBtn");

if (addPostForm) {
  addPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("postFile");
    const file = fileInput.files[0];

    if (!file) {
      alert("Будь ласка, виберіть файл зображення!");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Завантаження...";

    try {
      // ФІКС ПОМИЛКИ: Очищаємо ім'я файлу від зайвих крапок та пробілів
      const fileExt = file.name.split(".").pop();
      const fileName = `img_${Date.now()}.${fileExt}`;

      // Завантажуємо файл ПРЯМО в корінь бакета 'posts' без папок
      let { error: uploadError } = await _supabase.storage
        .from("posts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Отримання публічного посилання
      const { data: urlData } = _supabase.storage
        .from("posts")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Запис у таблицю posts
      const newPost = {
        title: document.getElementById("postTitle").value,
        category: document.getElementById("postCategory").value,
        description: document.getElementById("postDesc").value,
        image: imageUrl,
      };

      const { error: insertError } = await _supabase
        .from("posts")
        .insert([newPost]);

      if (insertError) throw insertError;

      alert("Звіт успішно опубліковано!");
      addPostForm.reset();
      loadAdminPosts();
    } catch (error) {
      // Якщо помилка каже "Duplicate", значить файл з таким ім'ям вже є
      alert("Помилка: " + error.message);
      console.error(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "Опублікувати";
    }
  });
}

async function deletePost(id) {
  if (confirm("Ви впевнені, що хочете видалити цей пост?")) {
    const { error } = await _supabase.from("posts").delete().eq("id", id);
    if (error) alert(error.message);
    else loadAdminPosts();
  }
}

function openEditModal(post) {
  document.getElementById("editPostId").value = post.id;
  document.getElementById("editTitle").value = post.title;
  document.getElementById("editCategory").value = post.category;
  document.getElementById("editDesc").value = post.description;
  document.getElementById("editModal").style.display = "block";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

const editPostForm = document.getElementById("editPostForm");
if (editPostForm) {
  editPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editPostId").value;
    const updatedPost = {
      title: document.getElementById("editTitle").value,
      category: document.getElementById("editCategory").value,
      description: document.getElementById("editDesc").value,
    };

    const { error } = await _supabase
      .from("posts")
      .update(updatedPost)
      .eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      alert("Дані оновлено!");
      closeModal();
      loadAdminPosts();
    }
  });
}
