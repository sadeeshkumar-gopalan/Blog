// Blog JavaScript - Fetches and displays blog posts from API
const API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a single post page or blog listing page
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        // Hide blog listing, show single post container
        const blogPostsEl = document.getElementById('blogPosts');
        const blogPostEl = document.getElementById('blogPost');
        if (blogPostsEl) blogPostsEl.style.display = 'none';
        if (blogPostEl) blogPostEl.style.display = 'block';
        loadSinglePost(postId);
    } else {
        // Show blog listing, hide single post container
        const blogPostsEl = document.getElementById('blogPosts');
        const blogPostEl = document.getElementById('blogPost');
        if (blogPostsEl) blogPostsEl.style.display = 'block';
        if (blogPostEl) blogPostEl.style.display = 'none';
        loadAllPosts();
    }
});

async function loadAllPosts() {
    const blogContainer = document.getElementById('blogPosts');
    if (!blogContainer) return;

    try {
        blogContainer.innerHTML = '<div class="loading">Loading posts...</div>';

        const response = await fetch(`${API_BASE_URL}/api/blogs`);
        if (!response.ok) throw new Error('Failed to fetch posts');

        const posts = await response.json();

        if (posts.length === 0) {
            blogContainer.innerHTML = '<div class="no-posts"><p>No blog posts yet. Check back soon!</p></div>';
            return;
        }

        blogContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = createPostCard(post);
            blogContainer.appendChild(postElement);
        });

    } catch (error) {
        console.error('Error loading posts:', error);
        blogContainer.innerHTML = `
            <div class="error">
                <p><strong>Failed to load blog posts.</strong></p>
                <p>Make sure the backend server is running on ${API_BASE_URL}</p>
                <p>Error: ${error.message}</p>
                <p style="margin-top: 20px;">
                    <a href="${API_BASE_URL}/docs" target="_blank">Check Backend API Docs</a> | 
                    <a href="javascript:location.reload()">Reload Page</a>
                </p>
            </div>
        `;
    }
}

async function loadSinglePost(postId) {
    const blogContainer = document.getElementById('blogPost');
    if (!blogContainer) return;

    try {
        blogContainer.innerHTML = '<div class="loading">Loading post...</div>';

        const response = await fetch(`${API_BASE_URL}/api/blogs/${postId}`);
        if (!response.ok) throw new Error('Post not found');

        const post = await response.json();

        blogContainer.innerHTML = createPostDetail(post);

    } catch (error) {
        console.error('Error loading post:', error);
        blogContainer.innerHTML = `
            <div class="error">
                <p><strong>Failed to load post.</strong></p>
                <p>Make sure the backend server is running on ${API_BASE_URL}</p>
                <p>Error: ${error.message}</p>
                <p style="margin-top: 20px;">
                    <a href="blog.html">← Back to blog</a> | 
                    <a href="${API_BASE_URL}/docs" target="_blank">Check Backend API</a>
                </p>
            </div>
        `;
    }
}

function createPostCard(post) {
    const article = document.createElement('article');
    article.className = 'blog-post-card';

    // Get preview text (first 50 words)
    const previewText = post.text_content
        ? getPreviewText(post.text_content, 50)
        : (post.caption || '');

    // Get image URL for preview
    const imageUrl = getImageUrl(post);

    article.innerHTML = `
        ${imageUrl ? `<div class="post-image-container">
            <img src="${imageUrl}" alt="${post.title}" class="post-image-preview" loading="lazy">
        </div>` : ''}
        <div class="post-content">
            <div class="post-meta">
                <span class="post-category">${escapeHtml(post.category)}</span>
                <span class="post-date">${formatDate(post.created_at)}</span>
            </div>
            <h2 class="post-title">
                <a href="blog.html?id=${post.id}">${escapeHtml(post.title)}</a>
            </h2>
            ${previewText ? `<p class="post-preview">${previewText}</p>` : ''}
            <a href="blog.html?id=${post.id}" class="read-more">Read More →</a>
        </div>
    `;

    return article;
}

function createPostDetail(post) {
    const imageUrl = getImageUrl(post);
    const videoUrl = getVideoUrl(post);

    let contentHtml = '';

    // Render text content as HTML to preserve formatting (bullet points, bold, etc.)
    if (post.text_content) {
        // The text_content may already contain HTML, so we insert it directly
        // This preserves all formatting like <ul>, <li>, <strong>, etc.
        // The text_content may already contain HTML, so we insert it directly
        // The text_content may already contain HTML, so we insert it directly
        // Use recursive decoding to handle any level of escaping (1x, 2x, 3x...)
        let decoded = post.text_content;
        // Decode up to 5 times or until stable
        for (let i = 0; i < 5; i++) {
            const temp = decodeHtml(decoded);
            if (temp === decoded) break;
            decoded = temp;
        }
        contentHtml = `<div class="post-text-content">${decoded}</div>`;
    }

    return `
        <article class="blog-post-detail">
            <div class="post-header">
                <div class="post-meta">
                    <span class="post-category">${escapeHtml(post.category)}</span>
                    <span class="post-date">${formatDate(post.created_at)}</span>
                </div>
                <h1 class="post-title-detail">${escapeHtml(post.title)}</h1>
            </div>
            
            ${imageUrl && post.content_type !== 'image_text' ? `
                <div class="post-media-container">
                    <img src="${imageUrl}" alt="${escapeHtml(post.title)}" class="post-image-full" loading="lazy">
                    ${post.caption ? `<p class="post-caption">${escapeHtml(post.caption)}</p>` : ''}
                </div>
            ` : ''}
            
            ${videoUrl ? `
                <div class="post-media-container">
                    <video src="${videoUrl}" controls class="post-video-full" preload="metadata">
                        Your browser does not support the video tag.
                    </video>
                    ${post.caption ? `<p class="post-caption">${escapeHtml(post.caption)}</p>` : ''}
                </div>
            ` : ''}
            
            ${post.content_type === 'image_text' && imageUrl ? `
                <div class="post-media-container">
                    <img src="${imageUrl}" alt="${escapeHtml(post.title)}" class="post-image-full" loading="lazy">
                    ${post.caption ? `<p class="post-caption">${escapeHtml(post.caption)}</p>` : ''}
                </div>
            ` : ''}
            
            ${contentHtml}
            
            <div class="post-footer">
                <a href="blog.html" class="back-link">← Back to all posts</a>
            </div>
        </article>
    `;
}

function getImageUrl(post) {
    if (!post.content_url) return null;

    if (post.content_type === 'image' || post.content_type === 'image_text') {
        // If it's a full URL, use it directly
        if (post.content_url.startsWith('http://') || post.content_url.startsWith('https://')) {
            return post.content_url;
        }
        // Otherwise, it's an uploaded file
        return `${API_BASE_URL}/uploads/${post.content_url}`;
    }

    return null;
}

function getVideoUrl(post) {
    if (!post.content_url || post.content_type !== 'video') return null;

    // If it's a full URL, use it directly
    if (post.content_url.startsWith('http://') || post.content_url.startsWith('https://')) {
        return post.content_url;
    }
    // Otherwise, it's an uploaded file
    return `${API_BASE_URL}/uploads/${post.content_url}`;
}

function getPreviewText(text, wordCount) {
    // Decode HTML entities TWICE to handle double-escaping
    let decoded = decodeHtml(text || '');
    decoded = decodeHtml(decoded);

    // Remove HTML tags for preview, but preserve line breaks
    const textOnly = decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textOnly.split(' ');

    if (words.length <= wordCount) {
        return textOnly;
    }

    return words.slice(0, wordCount).join(' ') + '...';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
