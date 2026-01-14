// Load API config
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000';

// Load blogs on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('blog.html')) {
        // Individual blog page - handled in blog.html
        return;
    }
    
    loadBlogs();
    setupNavigation();
});

async function loadBlogs(category = '') {
    const loadingEl = document.getElementById('loading');
    const containerEl = document.getElementById('blogsContainer');
    const noBlogsEl = document.getElementById('noBlogs');
    
    try {
        loadingEl.style.display = 'block';
        containerEl.innerHTML = '';
        noBlogsEl.style.display = 'none';
        
        const url = category 
            ? `${API_BASE_URL}/api/blogs?category=${encodeURIComponent(category)}`
            : `${API_BASE_URL}/api/blogs`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
        
        const blogs = await response.json();
        
        loadingEl.style.display = 'none';
        
        if (blogs.length === 0) {
            noBlogsEl.style.display = 'block';
            return;
        }
        
        // Populate categories in menu
        populateCategories(blogs);
        
        // Render blogs
        blogs.forEach(blog => {
            const blogCard = createBlogCard(blog);
            containerEl.appendChild(blogCard);
        });
        
    } catch (error) {
        console.error('Error loading blogs:', error);
        console.error('API URL:', API_BASE_URL);
        console.error('Full URL:', url);
        loadingEl.style.display = 'none';
        const errorMsg = error.message || 'Unknown error';
        containerEl.innerHTML = `<p class="error">Failed to load stories. Error: ${errorMsg}<br>API URL: ${API_BASE_URL}<br>Check the browser console for more details.</p>`;
    }
}

function populateCategories(blogs) {
    const categoriesMenu = document.getElementById('categoriesMenu');
    const existingCategories = new Set();
    
    // Get existing categories
    Array.from(categoriesMenu.children).forEach(item => {
        if (item.dataset.category) {
            existingCategories.add(item.dataset.category);
        }
    });
    
    // Add new categories
    blogs.forEach(blog => {
        if (!existingCategories.has(blog.category)) {
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            categoryLink.textContent = blog.category;
            categoryLink.dataset.category = blog.category;
            categoryLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadBlogs(blog.category);
                updateActiveNav(blog.category);
            });
            categoriesMenu.appendChild(categoryLink);
            existingCategories.add(blog.category);
        }
    });
}

function setupNavigation() {
    // Home link
    const homeLink = document.querySelector('.nav-link[data-category=""]');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadBlogs('');
            updateActiveNav('');
        });
    }
}

function updateActiveNav(category) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    if (category === '') {
        const homeLink = document.querySelector('.nav-link[data-category=""]');
        if (homeLink) homeLink.classList.add('active');
    }
}

function createBlogCard(blog) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    
    // Meta info (category, author, and date)
    const meta = document.createElement('div');
    meta.className = 'blog-meta';
    
    const categoryTag = document.createElement('span');
    categoryTag.className = 'category-tag';
    categoryTag.textContent = blog.category;
    
    const author = document.createElement('span');
    author.className = 'blog-author';
    author.textContent = 'by Sadeesh';
    
    const date = document.createElement('span');
    date.className = 'blog-date';
    date.textContent = new Date(blog.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    meta.appendChild(categoryTag);
    meta.appendChild(author);
    meta.appendChild(date);
    
    // Title
    const title = document.createElement('h2');
    title.className = 'blog-title';
    title.textContent = blog.title;
    
    // Content preview
    const preview = document.createElement('div');
    preview.className = 'blog-preview';
    
    if (blog.content_type === 'image' && blog.content_url) {
        const img = document.createElement('img');
        img.className = 'blog-image-preview';
        const imageUrl = blog.content_url.startsWith('http') 
            ? blog.content_url 
            : `${API_BASE_URL}/uploads/${blog.content_url}`;
        img.src = imageUrl;
        img.alt = blog.title;
        preview.appendChild(img);
        
        if (blog.caption) {
            const caption = document.createElement('div');
            caption.className = 'blog-caption';
            caption.textContent = blog.caption;
            preview.appendChild(caption);
        }
    } else if (blog.content_type === 'video' && blog.content_url) {
        const video = document.createElement('video');
        video.className = 'blog-video-preview';
        const videoUrl = blog.content_url.startsWith('http') 
            ? blog.content_url 
            : `${API_BASE_URL}/uploads/${blog.content_url}`;
        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;
        preview.appendChild(video);
        
        if (blog.caption) {
            const caption = document.createElement('div');
            caption.className = 'blog-caption';
            caption.textContent = blog.caption;
            preview.appendChild(caption);
        }
    } else if (blog.content_type === 'text' && blog.text_content) {
        // Show first 50 words as preview with read more
        const words = blog.text_content.split(' ');
        const hasMore = words.length > 50;
        const previewWords = hasMore ? words.slice(0, 50).join(' ') : blog.text_content;
        
        const textPreview = document.createElement('div');
        textPreview.className = 'blog-text-preview';
        
        const previewText = document.createElement('span');
        previewText.className = 'preview-text';
        previewText.textContent = previewWords + (hasMore ? '...' : '');
        textPreview.appendChild(previewText);
        
        if (hasMore) {
            const fullText = document.createElement('span');
            fullText.className = 'full-text';
            fullText.style.display = 'none';
            fullText.textContent = blog.text_content;
            textPreview.appendChild(fullText);
            
            const readMoreBtn = document.createElement('button');
            readMoreBtn.className = 'read-more-btn';
            readMoreBtn.textContent = 'Read more';
            readMoreBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (previewText.style.display !== 'none') {
                    previewText.style.display = 'none';
                    fullText.style.display = 'inline';
                    readMoreBtn.textContent = 'Read less';
                } else {
                    previewText.style.display = 'inline';
                    fullText.style.display = 'none';
                    readMoreBtn.textContent = 'Read more';
                }
            };
            textPreview.appendChild(readMoreBtn);
        }
        
        preview.appendChild(textPreview);
    } else if (blog.content_type === 'image_text' && blog.content_url && blog.text_content) {
        // Image with text - show image and text preview
        const img = document.createElement('img');
        img.className = 'blog-image-preview';
        const imageUrl = blog.content_url.startsWith('http') 
            ? blog.content_url 
            : `${API_BASE_URL}/uploads/${blog.content_url}`;
        img.src = imageUrl;
        img.alt = blog.title;
        preview.appendChild(img);
        
        if (blog.caption) {
            const caption = document.createElement('div');
            caption.className = 'blog-caption';
            caption.textContent = blog.caption;
            preview.appendChild(caption);
        }
        
        // Show first 50 words of text with read more
        const words = blog.text_content.split(' ');
        const hasMore = words.length > 50;
        const previewWords = hasMore ? words.slice(0, 50).join(' ') : blog.text_content;
        
        const textPreview = document.createElement('div');
        textPreview.className = 'blog-text-preview';
        
        const previewText = document.createElement('span');
        previewText.className = 'preview-text';
        previewText.textContent = previewWords + (hasMore ? '...' : '');
        textPreview.appendChild(previewText);
        
        if (hasMore) {
            const fullText = document.createElement('span');
            fullText.className = 'full-text';
            fullText.style.display = 'none';
            fullText.textContent = blog.text_content;
            textPreview.appendChild(fullText);
            
            const readMoreBtn = document.createElement('button');
            readMoreBtn.className = 'read-more-btn';
            readMoreBtn.textContent = 'Read more';
            readMoreBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (previewText.style.display !== 'none') {
                    previewText.style.display = 'none';
                    fullText.style.display = 'inline';
                    readMoreBtn.textContent = 'Read less';
                } else {
                    previewText.style.display = 'inline';
                    fullText.style.display = 'none';
                    readMoreBtn.textContent = 'Read more';
                }
            };
            textPreview.appendChild(readMoreBtn);
        }
        
        preview.appendChild(textPreview);
    }
    
    card.appendChild(meta);
    card.appendChild(title);
    card.appendChild(preview);
    
    return card;
}

async function loadBlogPost(blogId) {
    const loadingEl = document.getElementById('loading');
    const blogEl = document.getElementById('blogPost');
    const errorEl = document.getElementById('error');
    
    try {
        loadingEl.style.display = 'block';
        blogEl.style.display = 'none';
        errorEl.style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`);
        if (!response.ok) throw new Error('Blog not found');
        
        const blog = await response.json();
        
        loadingEl.style.display = 'none';
        blogEl.style.display = 'block';
        
        // Populate blog details
        const categoryEl = document.getElementById('blogCategory');
        if (categoryEl) {
            categoryEl.textContent = blog.category;
        }
        
        document.getElementById('blogTitle').textContent = blog.title;
        document.getElementById('blogDate').textContent = new Date(blog.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const contentEl = document.getElementById('blogContent');
        contentEl.innerHTML = '';
        
        if (blog.content_type === 'image' && blog.content_url) {
            const img = document.createElement('img');
            const imageUrl = blog.content_url.startsWith('http') 
                ? blog.content_url 
                : `${API_BASE_URL}/uploads/${blog.content_url}`;
            img.src = imageUrl;
            img.alt = blog.title;
            contentEl.appendChild(img);
            
            if (blog.caption) {
                const caption = document.createElement('div');
                caption.className = 'caption';
                caption.textContent = blog.caption;
                contentEl.appendChild(caption);
            }
        } else if (blog.content_type === 'video' && blog.content_url) {
        const video = document.createElement('video');
        const videoUrl = blog.content_url.startsWith('http') 
            ? blog.content_url 
            : `${API_BASE_URL}/uploads/${blog.content_url}`;
        video.src = videoUrl;
        video.controls = true;
        video.style.width = '100%';
        contentEl.appendChild(video);
        
        if (blog.caption) {
            const caption = document.createElement('div');
            caption.className = 'caption';
            caption.textContent = blog.caption;
            contentEl.appendChild(caption);
        }
    } else if (blog.content_type === 'image_text' && blog.content_url && blog.text_content) {
        // Image with text content
        const img = document.createElement('img');
        const imageUrl = blog.content_url.startsWith('http') 
            ? blog.content_url 
            : `${API_BASE_URL}/uploads/${blog.content_url}`;
        img.src = imageUrl;
        img.alt = blog.title;
        contentEl.appendChild(img);
        
        if (blog.caption) {
            const caption = document.createElement('div');
            caption.className = 'caption';
            caption.textContent = blog.caption;
            contentEl.appendChild(caption);
        }
        
        const text = document.createElement('div');
        text.className = 'text-content';
        text.textContent = blog.text_content;
        contentEl.appendChild(text);
    } else if (blog.content_type === 'text' && blog.text_content) {
        const text = document.createElement('div');
        text.className = 'text-content';
        text.textContent = blog.text_content;
        contentEl.appendChild(text);
    }
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
}
