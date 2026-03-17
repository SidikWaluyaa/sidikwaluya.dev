/**
 * Sidik.Dev - Portfolio Main Script
 */

// --- CONFIGURATION ---
const CONFIG = {
    // Paste your Google Apps Script Web App URL here
    API_URL: "https://script.google.com/macros/s/AKfycbzQp8WPoF1PjQHGIFZ5SHJ19OKdJNKMXyarGHPWk9xN3BHv3OOrIaWSYISeT_KaK-TK/exec", 
    DATABASE: {
        SHEETS: {
            PROFILE: "profile",
            PROJECTS: "projects",
            SKILLS: "skills",
            EXPERIENCE: "experience",
            BLOG: "blog"
        }
    }
};

// --- STATE MANAGEMENT ---
let appState = {
    theme: localStorage.getItem('theme') || 'dark',
    projects: [],
    skills: [],
    experience: [],
    blog: [],
    profile: {}
};

// --- DOM ELEMENTS ---
const themeToggle = document.getElementById('theme-toggle');
const projectsGrid = document.getElementById('projects-grid');
const skillsGrid = document.getElementById('skills-grid');
const timeline = document.getElementById('timeline');
const blogGrid = document.getElementById('blog-grid');
const filterBtns = document.getElementById('filter-btns');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadAllData();
    setupEventListeners();
});

// --- THEME LOGIC ---
function initTheme() {
    document.documentElement.setAttribute('data-theme', appState.theme);
    updateThemeIcon();
}

function toggleTheme() {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', appState.theme);
    localStorage.setItem('theme', appState.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (appState.theme === 'dark') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// --- API SERVICES ---
async function fetchData(route) {
    if (!CONFIG.API_URL) {
        console.warn(`API_URL not configured. Using mock data for ${route}.`);
        return getMockData(route);
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?route=${route}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${route}:`, error);
        return [];
    }
}

// --- DATA LOADING ---
async function loadAllData() {
    // Parallel loading
    const [profile, projects, skills, experience, blog] = await Promise.all([
        fetchData(CONFIG.DATABASE.SHEETS.PROFILE),
        fetchData(CONFIG.DATABASE.SHEETS.PROJECTS),
        fetchData(CONFIG.DATABASE.SHEETS.SKILLS),
        fetchData(CONFIG.DATABASE.SHEETS.EXPERIENCE),
        fetchData(CONFIG.DATABASE.SHEETS.BLOG)
    ]);

    appState.profile = Array.isArray(profile) ? profile[0] : profile;
    appState.projects = projects;
    appState.skills = skills;
    appState.experience = experience;
    appState.blog = blog;

    renderProfile();
    renderSkills();
    renderProjects(appState.projects);
    renderExperience();
    renderBlog();
}

// --- RENDERING ---

function renderProfile() {
    if (!appState.profile) return;
    document.getElementById('hero-name').textContent = appState.profile.name || "Sidik Waluya";
    document.getElementById('hero-title').textContent = appState.profile.role || "UI/UX Designer & Web Developer";
    document.getElementById('bio-content').textContent = appState.profile.bio || "Crafting premium digital experiences.";
    if (appState.profile.photo) {
        document.getElementById('profile-photo').src = appState.profile.photo;
    }
}

function renderSkills() {
    skillsGrid.innerHTML = appState.skills.map(s => `
        <div class="glass p-2" data-aos="zoom-in">
            <div class="flex-between mb-1">
                <span class="font-bold">${s.skill}</span>
                <span class="text-primary">${s.level}%</span>
            </div>
            <div class="skill-bar-bg">
                <div class="skill-bar-fill" style="width: ${s.level}%;"></div>
            </div>
        </div>
    `).join('');
}

function renderProjects(data) {
    projectsGrid.innerHTML = data.map(p => `
        <div class="glass overflow-hidden flex flex-column" data-aos="fade-up">
            <div class="h-200 overflow-hidden">
                <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover project-img">
            </div>
            <div class="card-content">
                <span class="text-secondary font-sm font-bold uppercase mb-1">${p.category}</span>
                <h3 class="mb-1">${p.title}</h3>
                <p class="text-muted font-sm mb-2 flex-grow">${p.description}</p>
                <div class="flex gap-1 flex-wrap mb-2">
                    ${p.tech.split(',').map(t => `<span class="glass px-2 py-1 font-sm">${t.trim()}</span>`).join('')}
                </div>
                <a href="${p.link}" class="btn btn-primary w-full" target="_blank">View Project</a>
            </div>
        </div>
    `).join('');
}

function renderExperience() {
    timeline.innerHTML = appState.experience.map((ex, idx) => `
        <div class="flex gap-4 mb-3 relative" data-aos="${idx % 2 === 0 ? 'fade-left' : 'fade-right'}">
            <div class="timeline-year">${ex.year}</div>
            <div class="flex-grow p-2 glass">
                <h4 class="text-secondary">${ex.role}</h4>
                <p class="font-bold">${ex.company}</p>
            </div>
        </div>
    `).join('');
}

function renderBlog() {
    blogGrid.innerHTML = appState.blog.map(b => `
        <div class="glass overflow-hidden" data-aos="fade-up">
            <img src="${b.image}" alt="${b.title}" class="w-full h-180 object-cover">
            <div class="p-2">
                <p class="font-sm text-muted mb-1">${b.date} • ${b.category}</p>
                <h4 class="mb-1">${b.title}</h4>
                <a href="blog-detail.html?id=${b.id}" class="text-primary font-bold font-sm">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    `).join('');
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    
    // Project filter
    filterBtns.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn')) return;
        
        const filter = e.target.getAttribute('data-filter');
        
        // Update active btn
        filterBtns.querySelectorAll('.btn').forEach(btn => btn.classList.remove('btn-primary'));
        filterBtns.querySelectorAll('.btn').forEach(btn => btn.classList.add('btn-secondary'));
        e.target.classList.remove('btn-secondary');
        e.target.classList.add('btn-primary');
        
        // Filter projects
        const filtered = filter === 'all' 
            ? appState.projects 
            : appState.projects.filter(p => p.category === filter);
        
        renderProjects(filtered);
    });
}

// --- MOCK DATA FOR DEMO ---
function getMockData(route) {
    const mocks = {
        profile: [{ name: "Sidik Waluya", role: "UI/UX Designer & Web Developer", bio: "Passionate about creating beautiful and functional digital products.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop" }],
        projects: [
            { id: 1, title: "E-Commerce Glass UI", description: "A high-performance e-commerce platform with glassmorphism design.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800", tech: "HTML, CSS, JS", link: "#", category: "Web Development" },
            { id: 2, title: "Crypto Tracker App", description: "Real-time cryptocurrency monitoring application.", image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=800", tech: "Mobile, React", link: "#", category: "Mobile App" }
        ],
        skills: [
            { id: 1, skill: "Frontend Development", level: 90 },
            { id: 2, skill: "UI/UX Design", level: 85 }
        ],
        experience: [
            { id: 1, company: "Tech Solutions", role: "Senior Web Developer", year: "2023 - Present" },
            { id: 2, company: "Creative Agency", role: "UI Designer", year: "2021 - 2023" }
        ],
        blog: [
            { id: 1, title: "The Future of Web Design", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800", date: "Mar 10, 2026", category: "Design" }
        ]
    };
    return mocks[route] || [];
}
