document.addEventListener("DOMContentLoaded", async () => {
  const user = await window.getCurrentProfile();

  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  loadAdminPosts();
  loadAdminComments();
  loadAdminContactMessages();
});

async function loadAdminPosts() {
  const listContainer = document.getElementById("adminPostsList");
  if (!listContainer) return;

  const { data: posts, error } = await window._supabase
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

async function loadAdminComments() {
  const commentsContainer = document.getElementById("adminCommentsList");
  if (!commentsContainer) return;

  commentsContainer.innerHTML =
    '<p class="posts-message">Завантаження коментарів...</p>';

  try {
    const [{ data: comments, error: commentsError }, { data: posts }] =
      await Promise.all([
        window._supabase
          .from("comments")
          .select("*")
          .order("created_at", { ascending: false }),
        window._supabase.from("posts").select("id,title"),
      ]);

    if (commentsError) throw commentsError;

    renderAdminComments(comments || [], posts || []);
  } catch (error) {
    console.error("Помилка отримання коментарів:", error);
    commentsContainer.innerHTML =
      '<p class="posts-message posts-error">Не вдалося завантажити коментарі. Перевірте таблицю comments у Supabase.</p>';
  }
}

function renderAdminComments(comments, posts) {
  const commentsContainer = document.getElementById("adminCommentsList");
  if (!commentsContainer) return;

  commentsContainer.innerHTML = "";

  if (comments.length === 0) {
    commentsContainer.innerHTML =
      '<p class="posts-message">Коментарів ще немає.</p>';
    return;
  }

  const postTitleById = new Map(
    posts.map((post) => [String(post.id), post.title || "Без назви"]),
  );

  comments.forEach((comment) => {
    const div = document.createElement("div");
    div.className = "admin-comment-card";

    const info = document.createElement("div");
    info.className = "admin-comment-info";

    const meta = document.createElement("p");
    meta.className = "admin-comment-meta";
    meta.textContent = `${comment.author || "Гість"} - ${formatDate(comment.created_at)}`;

    const postTitle = document.createElement("h4");
    postTitle.textContent =
      postTitleById.get(String(comment.post_id)) || `Звіт #${comment.post_id}`;

    const text = document.createElement("p");
    text.textContent = comment.text || "";

    const actions = document.createElement("div");
    actions.className = "admin-actions";

    const openButton = document.createElement("button");
    openButton.className = "edit-btn";
    openButton.type = "button";
    openButton.textContent = "Відкрити звіт";
    openButton.addEventListener("click", () => {
      window.location.href = `post.html?id=${encodeURIComponent(comment.post_id)}`;
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Видалити";
    deleteButton.addEventListener("click", () => deleteComment(comment.id));

    info.append(meta, postTitle, text);
    actions.append(openButton, deleteButton);
    div.append(info, actions);
    commentsContainer.appendChild(div);
  });
}

async function loadAdminContactMessages() {
  const messagesContainer = document.getElementById(
    "adminContactMessagesList",
  );
  if (!messagesContainer) return;

  messagesContainer.innerHTML =
    '<p class="posts-message">Завантаження повідомлень...</p>';

  try {
    const { data: messages, error } = await window._supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    renderAdminContactMessages(messages || []);
  } catch (error) {
    console.error("Помилка отримання контактних повідомлень:", error);
    messagesContainer.innerHTML =
      '<p class="posts-message posts-error">Не вдалося завантажити повідомлення. Перевірте таблицю contact_messages у Supabase.</p>';
  }
}

function renderAdminContactMessages(messages) {
  const messagesContainer = document.getElementById(
    "adminContactMessagesList",
  );
  if (!messagesContainer) return;

  messagesContainer.innerHTML = "";

  if (messages.length === 0) {
    messagesContainer.innerHTML =
      '<p class="posts-message">Повідомлень ще немає.</p>';
    return;
  }

  messages.forEach((message) => {
    const div = document.createElement("div");
    div.className = "admin-comment-card";

    const info = document.createElement("div");
    info.className = "admin-comment-info";

    const meta = document.createElement("p");
    meta.className = "admin-comment-meta";
    meta.textContent = formatDate(message.created_at);

    const sender = document.createElement("h4");
    sender.textContent = message.name || "Без імені";

    const email = document.createElement("a");
    email.className = "admin-contact-email";
    email.href = `mailto:${message.email || ""}`;
    email.textContent = message.email || "Email не вказано";

    const text = document.createElement("p");
    text.textContent = message.message || "";

    const actions = document.createElement("div");
    actions.className = "admin-actions";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Видалити";
    deleteButton.addEventListener("click", () =>
      deleteContactMessage(message.id),
    );

    info.append(meta, sender, email, text);
    actions.append(deleteButton);
    div.append(info, actions);
    messagesContainer.appendChild(div);
  });
}

const addPostForm = document.getElementById("addPostForm");
const submitBtn = document.getElementById("submitBtn");
const postFileInput = document.getElementById("postFile");
const postImagePreview = document.getElementById("postImagePreview");
const clearPostImageBtn = document.getElementById("clearPostImageBtn");

function clearSelectedPostImage() {
  if (postFileInput) postFileInput.value = "";
  if (postImagePreview) {
    const previewImage = postImagePreview.querySelector("img");
    postImagePreview.hidden = true;
    if (previewImage) previewImage.removeAttribute("src");
  }
  if (clearPostImageBtn) clearPostImageBtn.hidden = true;
}

if (postFileInput && postImagePreview) {
  postFileInput.addEventListener("change", async () => {
    const file = postFileInput.files[0];
    const previewImage = postImagePreview.querySelector("img");

    if (!file) {
      clearSelectedPostImage();
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Будь ласка, оберіть саме зображення.");
      postFileInput.value = "";
      clearSelectedPostImage();
      return;
    }

    try {
      previewImage.src = await fileToCompressedDataUrl(file);
      postImagePreview.hidden = false;
      if (clearPostImageBtn) clearPostImageBtn.hidden = false;
    } catch (error) {
      console.error("Помилка попереднього перегляду:", error);
      alert("Не вдалося відкрити це фото.");
      postFileInput.value = "";
      clearSelectedPostImage();
    }
  });
}

if (clearPostImageBtn) {
  clearPostImageBtn.addEventListener("click", () => {
    clearSelectedPostImage();
  });
}

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
    submitBtn.innerText = "Завантаження фото...";

    try {
      const imageUrl = await uploadPostImage(file);

      const newPost = {
        title: document.getElementById("postTitle").value,
        category: document.getElementById("postCategory").value,
        description: document.getElementById("postDesc").value,
        image_path: imageUrl,
      };

      submitBtn.innerText = "Публікація...";

      const { error: insertError } = await window._supabase
        .from("posts")
        .insert([newPost]);

      if (insertError) throw insertError;

      alert("Звіт успішно опубліковано!");
      addPostForm.reset();
      clearSelectedPostImage();
      loadAdminPosts();
    } catch (error) {
      alert("Помилка: " + error.message);
      console.error(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "Опублікувати";
    }
  });
}

async function uploadPostImage(file) {
  const imageDataUrl = await fileToCompressedDataUrl(file);
  const imageBlob = await dataUrlToBlob(imageDataUrl);
  const filePath = `posts/${Date.now()}-${createSafeFileName(file.name)}`;

  const { error: uploadError } = await window._supabase.storage
    .from("post-images")
    .upload(filePath, imageBlob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = window._supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Не вдалося отримати посилання на фото.");
  }

  return data.publicUrl;
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

function createSafeFileName(fileName) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const safeName =
    nameWithoutExtension
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";

  return `${safeName}.jpg`;
}

function fileToCompressedDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxWidth = 1400;
        const maxHeight = 1000;
        const scale = Math.min(
          1,
          maxWidth / image.width,
          maxHeight / image.height,
        );
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      image.onerror = () => reject(new Error("Не вдалося прочитати фото."));
      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error("Не вдалося прочитати файл."));
    reader.readAsDataURL(file);
  });
}

async function deletePost(id) {
  if (confirm("Ви впевнені, що хочете видалити цей пост?")) {
    const { error } = await window._supabase
      .from("posts")
      .delete()
      .eq("id", id);
    if (error) alert(error.message);
    else loadAdminPosts();
  }
}

async function deleteComment(id) {
  if (!confirm("Видалити цей коментар?")) return;

  const { error } = await window._supabase
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdminComments();
}

async function deleteContactMessage(id) {
  if (!confirm("Видалити це повідомлення?")) return;

  const { error } = await window._supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdminContactMessages();
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

    const { error } = await window._supabase
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

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

window.deletePost = deletePost;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
