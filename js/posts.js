document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
  setupSearch();
});

async function loadPosts() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="posts-loader" role="status" aria-live="polite">
      <span class="wheat-loader" aria-hidden="true">🌾</span>
      <span>Завантажуємо звіти...</span>
    </div>
  `;

  try {
    const posts = await getPostsFromSupabase();
    renderPosts(posts);
  } catch (error) {
    console.error("Помилка Supabase:", error);
    container.innerHTML = `<p class="posts-message posts-error">Не вдалося завантажити звіти. Supabase: ${error.message}</p>`;
  }
}

async function getPostsFromSupabase() {
  const config = window.supabaseConfig;

  if (!config?.url || !config?.key) {
    throw new Error("Немає налаштувань Supabase.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  const url = `${config.url}/rest/v1/posts?select=*&order=id.desc`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    if (!response.ok) {
      throw new Error(data.message || "Supabase повернув помилку.");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Запит до Supabase тривав занадто довго.", {
        cause: error,
      });
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function renderPosts(posts) {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (posts.length === 0) {
    container.innerHTML =
      '<p class="posts-message">Наразі публікацій немає.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    const card = document.createElement("article");
    const image = getPostImage(post);
    const postId = post.id;
    const title = post.title || "Без назви";
    const category = post.category || "Звіт";
    const description = post.description || "";

    card.className = "post-card";
    card.dataset.title = normalizeFilterText(title);
    card.dataset.category = normalizeFilterText(category);
    card.dataset.description = normalizeFilterText(description);
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Відкрити звіт: ${title}`);
    card.addEventListener("click", () => openPost(postId));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPost(postId);
      }
    });

    const imageWrap = document.createElement("div");
    imageWrap.className = `post-image-wrap${image ? "" : " image-failed"}`;

    if (image) {
      const imageElement = document.createElement("img");
      imageElement.src = image;
      imageElement.alt = title;
      imageElement.loading = "lazy";
      imageWrap.appendChild(imageElement);
    }

    const placeholder = document.createElement("div");
    placeholder.className = "post-image-placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.innerHTML = "<span>🌾</span>";
    imageWrap.appendChild(placeholder);

    const postInfo = document.createElement("div");
    postInfo.className = "post-info";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const categoryText = document.createElement("p");
    const categoryBadge = document.createElement("strong");
    categoryBadge.textContent = category;
    categoryText.appendChild(categoryBadge);

    const descriptionText = document.createElement("p");
    descriptionText.textContent = description;

    postInfo.append(heading, categoryText, descriptionText);
    card.append(imageWrap, postInfo);

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
  setupImageFallbacks(container);
}

function getPostImage(post) {
  const directKeys = [
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

  const directValue = directKeys
    .map((key) => post[key])
    .find((value) => typeof value === "string" && value.trim());

  if (directValue) {
    return normalizeImageUrl(directValue);
  }

  const guessedValue = Object.entries(post).find(([key, value]) => {
    const normalizedKey = key.toLowerCase();

    return (
      typeof value === "string" &&
      value.trim() &&
      (normalizedKey.includes("image") ||
        normalizedKey.includes("photo") ||
        normalizedKey.includes("picture"))
    );
  })?.[1];

  return guessedValue ? normalizeImageUrl(guessedValue) : "";
}

function openPost(postId) {
  if (postId === undefined || postId === null) return;

  window.location.href = `post.html?id=${encodeURIComponent(postId)}`;
}

function normalizeImageUrl(value) {
  const url = String(value).trim();

  if (!url) return "";

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

function setupSearch() {
  const searchBar = document.getElementById("searchBar");
  const searchContainer = document.querySelector(".search-container");
  const filterButtons = document.querySelectorAll(".category-filter");
  if (!searchBar) return;

  let selectedCategory = "";

  const applyFilters = () => {
    const query = normalizeFilterText(searchBar.value);
    const cards = document.querySelectorAll(".post-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const title = card.dataset.title || "";
      const category = card.dataset.category || "";
      const description = card.dataset.description || "";
      const matchesQuery =
        !query || title.includes(query) || description.includes(query);
      const matchesCategory =
        !selectedCategory || category === selectedCategory;
      const isVisible = matchesQuery && matchesCategory;

      card.style.display = isVisible ? "block" : "none";
      if (isVisible) visibleCount += 1;
    });

    renderNoResultsMessage(visibleCount, Boolean(query || selectedCategory));
  };

  searchBar.addEventListener("focus", () => {
    searchContainer?.classList.add("filters-open");
  });

  searchBar.addEventListener("input", applyFilters);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = normalizeFilterText(button.dataset.category || "");

      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      searchContainer?.classList.add("filters-open");
      applyFilters();
    });
  });
}

function normalizeFilterText(value) {
  return String(value || "").trim().toLowerCase();
}

function renderNoResultsMessage(visibleCount, isFiltering) {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  const existingMessage = container.querySelector(".posts-no-results");

  if (visibleCount > 0 || !isFiltering) {
    existingMessage?.remove();
    return;
  }

  if (existingMessage) return;

  const message = document.createElement("p");
  message.className = "posts-message posts-no-results";
  message.textContent = "За цим пошуком або фільтром публікацій немає.";
  container.appendChild(message);
}
