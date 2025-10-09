// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateStats(); // ADD THIS LINE
});

function initializeApp() {
    populateCategoryFilter();
    renderProjects(projects);
    setupEventListeners();
}

// ADD THIS FUNCTION
function updateStats() {
    const projectsCount = projects.length;
    const completedCount = projects.filter(p => p.status === 'Completed').length;
    const technologiesCount = [...new Set(projects.flatMap(p => p.technologies))].length;
    
    // Animate counting
    animateCount('projectsCount', projectsCount);
    animateCount('completedCount', completedCount);
    animateCount('technologiesCount', technologiesCount);
}

// ADD THIS FUNCTION
function animateCount(elementId, target) {
    const element = document.getElementById(elementId);
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(projects.map(project => project.category))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('search');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    searchInput.addEventListener('input', filterProjects);
    categoryFilter.addEventListener('change', filterProjects);
    statusFilter.addEventListener('change', filterProjects);
}

function filterProjects() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm) ||
                            project.description.toLowerCase().includes(searchTerm) ||
                            project.technologies.some(tech => tech.toLowerCase().includes(searchTerm));
        
        const matchesCategory = category === 'all' || project.category === category;
        const matchesStatus = status === 'all' || project.status === status;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderProjects(filteredProjects);
}

function renderProjects(projectsToRender) {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (projectsToRender.length === 0) {
        projectsGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-search fa-2x mb-3"></i>
                <p>No projects found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    projectsGrid.innerHTML = projectsToRender.map(project => `
        <div class="project-card">
            <div class="project-media">
                ${getMediaElement(project)}
                
                <div class="project-badges">
                    <div class="project-badge ${project.status === 'Completed' ? 'badge-completed' : 'badge-inprogress'}">
                        ${project.status === 'Completed' ? '✓ COMPLETED' : '🔄 IN PROGRESS'}
                    </div>
                    ${project.featured ? `
                        <div class="project-badge badge-featured">
                            ⭐ FEATURED
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <span class="project-category">${project.category}</span>
                <p class="project-description">${project.description}</p>
                
                <div class="project-tech">
                    ${project.technologies.map(tech => `
                        <span class="tech-tag">${tech}</span>
                    `).join('')}
                </div>
                
                <div class="project-meta">
                    <span class="project-year">${project.year}</span>
                    <span>${project.technologies.length} technologies</span>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to videos for better UX
    setupVideoPlayers();
}

function getMediaElement(project) {
    // If video exists, use video with poster as fallback
    if (project.video) {
        return `
            <video controls muted preload="metadata" poster="${project.image || ''}">
                <source src="${project.video}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    }
    // If image exists, use image
    else if (project.image) {
        return `<img src="${project.image}" alt="${project.title}" loading="lazy">`;
    }
    // Fallback to placeholder
    else {
        return `
            <div class="media-placeholder">
                <i class="fas fa-project-diagram"></i>
            </div>
        `;
    }
}

function setupVideoPlayers() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.addEventListener('error', function() {
            console.log('Video failed to load:', this.src);
            // If video fails to load, try to show image instead
            const poster = this.getAttribute('poster');
            if (poster) {
                this.style.display = 'none';
                const img = document.createElement('img');
                img.src = poster;
                img.alt = 'Project image';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                this.parentNode.appendChild(img);
            }
        });
    });
}