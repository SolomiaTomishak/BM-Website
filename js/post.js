const postId = new URLSearchParams(window.location.search).get("id");

document.addEventListener("DOMContentLoaded", () => {
  if (!postId) {
    showPostError("Звіт не знайдено: немає id у посиланні.");
    return;
  }

  loadSinglePost();
  loadComments();
  setupCommentForm();
});

async function loadSinglePost() {
  try {
    const { data: post, error } = await window._supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) throw error;

    renderSinglePost(post);
    document.title = `${post.title || "Звіт"} - Березівська молодь`;
  } catch (error) {
    console.error("Помилка завантаження звіту:", error);
    showPostError("Не вдалося завантажити цей звіт.");
  }
}

function renderSinglePost(post) {
  const container = document.getElementById("singlePost");
  if (!container) return;

  const image = getPostImage(post);
  const title = post.title || "Без назви";
  const category = post.category || "Звіт";
  const description = post.description || "";

  container.innerHTML = "";

  const imageWrap = document.createElement("div");
  imageWrap.className = `single-post-image post-image-wrap${image ? "" : " image-failed"}`;

  if (image) {
    const imageElement = document.createElement("img");
    imageElement.src = image;
    imageElement.alt = title;
    imageWrap.appendChild(imageElement);
    setupFullscreenImage(imageWrap, image, title);
  }

  const placeholder = document.createElement("div");
  placeholder.className = "post-image-placeholder";
  placeholder.setAttribute("aria-hidden", "true");
  placeholder.innerHTML = "<span>🌾</span>";
  imageWrap.appendChild(placeholder);

  const content = document.createElement("div");
  content.className = "single-post-content";

  const categoryBadge = document.createElement("strong");
  categoryBadge.className = "single-post-category";
  categoryBadge.textContent = category;

  const heading = document.createElement("h1");
  heading.textContent = title;

  const descriptionText = document.createElement("p");
  descriptionText.textContent = description;

  content.append(categoryBadge, heading, descriptionText);
  container.append(imageWrap, content);

  setupImageFallbacks(container);
}

function setupFullscreenImage(imageWrap, imageSrc, title) {
  imageWrap.classList.add("is-openable");
  imageWrap.setAttribute("role", "button");
  imageWrap.setAttribute("tabindex", "0");
  imageWrap.setAttribute("aria-label", "Відкрити фото на весь екран");

  imageWrap.addEventListener("click", () => {
    openImageLightbox(imageSrc, title);
  });

  imageWrap.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImageLightbox(imageSrc, title);
    }
  });
}

function openImageLightbox(imageSrc, title) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", title || "Фото поста");

  const closeButton = document.createElement("button");
  closeButton.className = "image-lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Закрити фото");
  closeButton.textContent = "×";

  const image = document.createElement("img");
  image.src = imageSrc;
  image.alt = title || "Фото поста";

  const closeLightbox = () => {
    document.removeEventListener("keydown", handleEscape);
    lightbox.remove();
  };

  function handleEscape(event) {
    if (event.key === "Escape") closeLightbox();
  }

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", handleEscape);

  lightbox.append(closeButton, image);
  document.body.appendChild(lightbox);
  closeButton.focus();
}

function showPostError(message) {
  const container = document.getElementById("singlePost");
  if (!container) return;

  container.innerHTML = `<p class="posts-message posts-error">${message}</p>`;
}

async function loadComments() {
  const commentsList = document.getElementById("commentsList");
  if (!commentsList) return;

  try {
    const { data: comments, error } = await window._supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    renderComments(comments || []);
  } catch (error) {
    console.error("Помилка завантаження коментарів:", error);
    commentsList.innerHTML =
      '<p class="posts-message posts-error">Не вдалося завантажити коментарі.</p>';
  }
}

function renderComments(comments) {
  const commentsList = document.getElementById("commentsList");
  if (!commentsList) return;

  commentsList.innerHTML = "";

  if (comments.length === 0) {
    commentsList.innerHTML =
      '<p class="posts-message">Коментарів ще немає. Будьте першими.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  comments.forEach((comment) => {
    const item = document.createElement("article");
    item.className = "comment-card";

    const header = document.createElement("div");
    header.className = "comment-header";

    const author = document.createElement("strong");
    author.textContent = comment.author || "Гість";

    const date = document.createElement("time");
    date.textContent = formatDate(comment.created_at);

    const text = document.createElement("p");
    text.textContent = comment.text || "";

    header.append(author, date);
    item.append(header, text);
    fragment.appendChild(item);
  });

  commentsList.appendChild(fragment);
}

function setupCommentForm() {
  const form = document.getElementById("commentForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const textInput = document.getElementById("commentText");
    const status = document.getElementById("commentStatus");
    const submitButton = form.querySelector("button");

    const author = "Гість";
    const text = textInput.value.trim();

    if (!text) return;

    submitButton.disabled = true;
    status.textContent = "Публікуємо коментар...";

    try {
      const { error } = await window._supabase.from("comments").insert([
        {
          post_id: postId,
          author,
          text,
        },
      ]);

      if (error) throw error;

      form.reset();
      status.textContent = "Коментар опубліковано.";
      loadComments();
    } catch (error) {
      console.error("Помилка додавання коментаря:", error);
      status.textContent = "Не вдалося опублікувати коментар.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

function getPostImage(post) {
  const keys = [
    "image_path",
    "image",
    "image_url",
    "imageUrl",
    "img",
    "img_url",
    "photo",
    "photo_url",
    "picture",
    "picture_url",
    "url",
    "link",
  ];

  const value = keys
    .map((key) => post[key])
    .find((item) => typeof item === "string" && item.trim());

  return value ? normalizeImageUrl(value) : "";
}

function normalizeImageUrl(value) {
  const url = String(value).trim();
  const googleDriveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);

  if (googleDriveMatch) {
    return `https://drive.google.com/uc?export=view&id=${googleDriveMatch[1]}`;
  }

  if (url.includes("dropbox.com")) {
    return url
      .replace("www.dropbox.com", "dl.dropboxusercontent.com")
      .replace("?dl=0", "");
  }

  return url;
}

function setupImageFallbacks(container) {
  const images = container.querySelectorAll(".post-image-wrap img");

  images.forEach((image) => {
    if (image.complete) {
      if (image.naturalWidth > 0) {
        image.closest(".post-image-wrap")?.classList.add("image-loaded");
      } else {
        image.closest(".post-image-wrap")?.classList.add("image-failed");
        image.remove();
      }

      return;
    }

    image.addEventListener(
      "load",
      () => {
        image.closest(".post-image-wrap")?.classList.add("image-loaded");
      },
      { once: true },
    );

    image.addEventListener(
      "error",
      () => {
        console.warn("Фото не завантажилось:", image.src);
        image.closest(".post-image-wrap")?.classList.add("image-failed");
        image.remove();
      },
      { once: true },
    );
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
