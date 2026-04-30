const defaultPosts = [
    { "id": 1, "title": "Жучок БМ", "description": "Цей дрон - це наша перша покупка для ЗСУ", "category": "Наша діяльність", "image": "./assets/post1.jpg" },
    { "id": 2, "title": "Пікап", "description": "Ми довго до цього йшли та нарешті зробили", "category": "Наша діяльність", "image": "./assets/post2.jpg" },
    { "id": 3, "title": "Червона рута", "description": "За 40 днів ми придбали другий автомобіль для наших захисників", "category": "Наша діяльність", "image": "./assets/post3.jpg" }
];

let postsData = JSON.parse(localStorage.getItem('sitePosts')) || defaultPosts;

if (!localStorage.getItem('sitePosts')) {
    localStorage.setItem('sitePosts', JSON.stringify(postsData));
}

const container = document.getElementById('postsContainer');
const searchBar = document.getElementById('searchBar');

function displayPosts(posts) {
    if (!container) return;
    container.innerHTML = ""; 
    
    if (posts.length === 0) {
        container.innerHTML = "<p>Нічого не знайдено :(</p>";
        return;
    }

    posts.forEach(post => {
        const card = `
            <div class="post-card">
                <img src="${post.image}" alt="${post.title}">
                <div class="post-info">
                    <h3>${post.title}</h3>
                    <p><strong>${post.category}</strong></p>
                    <p>${post.description}</p>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

if (container) displayPosts(postsData);

if (searchBar) {
    searchBar.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();
        const filteredPosts = postsData.filter(post => {
            return post.title.toLowerCase().includes(searchString) || 
                   post.description.toLowerCase().includes(searchString);
        });
        displayPosts(filteredPosts);
    });
}