
// ConnectX - Social Media Application

const postInput = document.getElementById("postInput");
const postButton = document.getElementById("postButton");
const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const suggestionsContainer = document.getElementById("suggestionsContainer");
const charCount = document.getElementById("charCount");

let currentFilter = "all";

const defaultPosts = [
    {
        id: 1,
        user: "Arun Kumar",
        username: "@arun",
        text: "Learning JavaScript every day! Small steps lead to big results. 🚀",
        likes: 12,
        liked: false,
        comments: ["Keep going!"],
        owner: false
    },
    {
        id: 2,
        user: "Priya",
        username: "@priya",
        text: "Just completed my first web development project! Excited for more. 💻",
        likes: 25,
        liked: false,
        comments: ["Congratulations!"],
        owner: false
    }
];

let posts = JSON.parse(localStorage.getItem("connectxPosts")) || defaultPosts;
let followedUsers = JSON.parse(localStorage.getItem("connectxFollowing")) || [];

const users = [
    { name: "Arun Kumar", username: "@arun" },
    { name: "Priya", username: "@priya" },
    { name: "Rahul", username: "@rahul" }
];

// Prevent user content from being interpreted as HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

// Save posts
function savePosts() {
    localStorage.setItem("connectxPosts", JSON.stringify(posts));
}

// Render posts
function displayPosts() {
    const search = searchInput.value.toLowerCase();

    let filteredPosts = posts.filter(post =>
        (post.text.toLowerCase().includes(search) ||
         post.user.toLowerCase().includes(search) ||
         post.username.toLowerCase().includes(search)) &&
        (currentFilter !== "following" || followedUsers.includes(post.username))
    );

    if (filteredPosts.length === 0) {
        postsContainer.innerHTML =
            "<p style='padding:25px;text-align:center;color:#888'>No posts found.</p>";
        return;
    }

    postsContainer.innerHTML = filteredPosts.map(post => `
        <article class="post">
            <div class="post-header">
                <div class="avatar">${escapeHTML(post.user.charAt(0).toUpperCase())}</div>

                <div class="post-info">
                    <h4>${escapeHTML(post.user)}</h4>
                    <span>${escapeHTML(post.username)}</span>
                </div>
            </div>

            <p class="post-text">${escapeHTML(post.text)}</p>

            <div class="post-actions">
                <button class="${post.liked ? "liked" : ""}"
                    data-action="like" data-id="${post.id}">
                    ${post.liked ? "❤️" : "♡"} ${post.likes}
                </button>

                <button data-action="comment" data-id="${post.id}">
                    💬 ${post.comments.length}
                </button>

                ${post.owner ? `
                    <button class="delete-btn"
                        data-action="delete" data-id="${post.id}">
                        🗑 Delete
                    </button>
                ` : ""}
            </div>

            <div class="comments" id="comments-${post.id}" hidden>
                <div class="comment-list">
                    ${post.comments.map(comment =>
                        `<p>${escapeHTML(comment)}</p>`
                    ).join("")}
                </div>

                <form class="comment-form" data-id="${post.id}">
                    <input type="text" placeholder="Write a comment..."
                        maxlength="150" required>
                    <button type="submit">Send</button>
                </form>
            </div>
        </article>
    `).join("");
}

// Create post
postButton.addEventListener("click", function() {
    const text = postInput.value.trim();

    if (text === "") {
        alert("Please write something before posting!");
        return;
    }

    const newPost = {
        id: Date.now(),
        user: "Sanjay Dharan",
        username: "@sanjay",
        text: text,
        likes: 0,
        liked: false,
        comments: [],
        owner: true
    };

    posts.unshift(newPost);

    savePosts();

    postInput.value = "";
    charCount.textContent = "0 / 280";
    currentFilter = "all";
    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.toggle("active", item.dataset.filter === "all");
    });

    displayPosts();
});

// Character count
postInput.addEventListener("input", function() {
    charCount.textContent = `${postInput.value.length} / 280`;
});

// Like, unlike, comment toggle and delete
postsContainer.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const post = posts.find(item => item.id === id);

    if (!post) return;

    const action = button.dataset.action;

    if (action === "like") {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        savePosts();
        displayPosts();
    }

    if (action === "comment") {
        const commentBox = document.getElementById(`comments-${id}`);
        commentBox.hidden = !commentBox.hidden;
    }

    if (action === "delete" && post.owner) {
        if (confirm("Are you sure you want to delete this post?")) {
            posts = posts.filter(item => item.id !== id);
            savePosts();
            displayPosts();
        }
    }
});

// Add comments
postsContainer.addEventListener("submit", function(event) {
    if (!event.target.matches(".comment-form")) return;

    event.preventDefault();

    const id = Number(event.target.dataset.id);
    const input = event.target.querySelector("input");
    const comment = input.value.trim();

    const post = posts.find(item => item.id === id);

    if (post && comment) {
        post.comments.push(comment);
        savePosts();
        displayPosts();

        document.getElementById(`comments-${id}`).hidden = false;
    }
});

// Search posts
searchInput.addEventListener("input", displayPosts);

// Home and Following filters
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", function(event) {
        event.preventDefault();

        currentFilter = item.dataset.filter;

        document.querySelectorAll(".menu-item").forEach(link =>
            link.classList.remove("active")
        );

        item.classList.add("active");
        displayPosts();
    });
});

// Display suggested users
function displaySuggestions() {
    suggestionsContainer.innerHTML = users.map(user => {
        const isFollowing = followedUsers.includes(user.username);

        return `
            <div class="follow-user">
                <div>
                    <strong>${escapeHTML(user.name)}</strong>
                    <p>${escapeHTML(user.username)}</p>
                </div>

                <button class="${isFollowing ? "following" : ""}"
                    data-user="${escapeHTML(user.username)}">
                    ${isFollowing ? "Following" : "Follow"}
                </button>
            </div>
        `;
    }).join("");
}

// Follow / Unfollow users
suggestionsContainer.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-user]");

    if (!button) return;

    const username = button.dataset.user;

    if (followedUsers.includes(username)) {
        followedUsers = followedUsers.filter(user => user !== username);
    } else {
        followedUsers.push(username);
    }

    localStorage.setItem(
        "connectxFollowing",
        JSON.stringify(followedUsers)
    );

    displaySuggestions();

    if (currentFilter === "following") {
        displayPosts();
    }
});

// Initial loading
displayPosts();
displaySuggestions();
