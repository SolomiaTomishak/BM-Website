const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
}

function renderAdminPosts() {
    const container = document.getElementById('adminPostsList');
    const posts = JSON.parse(localStorage.getItem('sitePosts')) || [];

    if (posts.length === 0) {
        container.innerHTML = "<p>Публікацій немає.</p>";
        return;
    }

    container.innerHTML = "";
    posts.forEach((post, index) => {
        container.innerHTML += `
            <div class="item-card">
                <button class="delete-btn" onclick="deletePost(${index})">Видалити пост</button>
                <h3>${post.title}</h3>
                <p><strong>Категорія:</strong> ${post.category}</p>
            </div>
        `;
    });
}

function deletePost(index) {
    if (confirm('Ви впевнені, що хочете видалити цей звіт?')) {
        let posts = JSON.parse(localStorage.getItem('sitePosts')) || [];
        posts.splice(index, 1);
        localStorage.setItem('sitePosts', JSON.stringify(posts));
        renderAdminPosts();
    }
}

function renderMessages() {
    const container = document.getElementById('messagesList');
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];

    if (messages.length === 0) {
        container.innerHTML = "<p>Повідомлень поки немає.</p>";
        return;
    }

    container.innerHTML = ""; 
    messages.forEach((msg, index) => {
        container.innerHTML += `
            <div class="item-card">
                <button class="delete-btn" onclick="deleteMsg(${index})">Видалити повідомлення</button>
                <h3>${msg.name}</h3>
                <p><strong>Email:</strong> ${msg.email}</p>
                <p><strong>Дата:</strong> ${msg.date}</p>
                <p>${msg.message}</p>
            </div>
        `;
    });
}

function deleteMsg(index) {
    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages.splice(index, 1);
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    renderMessages();
}

const addPostForm = document.getElementById('addPostForm');
if (addPostForm) {
    addPostForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newPost = {
            id: Date.now(),
            title: document.getElementById('postTitle').value,
            category: document.getElementById('postCategory').value,
            description: document.getElementById('postDesc').value,
            image: document.getElementById('postImage').value
        };

        let posts = JSON.parse(localStorage.getItem('sitePosts')) || [];
        posts.unshift(newPost);
        localStorage.setItem('sitePosts', JSON.stringify(posts));

        alert('Звіт додано!');
        this.reset();
        renderAdminPosts();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderAdminPosts();
    renderMessages();
});