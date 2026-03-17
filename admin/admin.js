/**
 * Admin Panel Logic
 */

const CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbzQp8WPoF1PjQHGIFZ5SHJ19OKdJNKMXyarGHPWk9xN3BHv3OOrIaWSYISeT_KaK-TK/exec" // Set your Web App URL here
};

let currentTab = 'overview';
let adminPassword = localStorage.getItem('adminPass') || '';
let currentData = { projects: [], skills: [], experience: [], blog: [] };
let editingId = null;
let currentRoute = '';

// Check if already logged in
if (adminPassword) {
    document.getElementById('login-screen').classList.add('hidden');
    loadDashboardData();
}

async function adminLogin() {
    const pass = document.getElementById('admin-pass').value;
    const msg = document.getElementById('login-msg');

    if (!CONFIG.API_URL) {
        // Mock login for development
        if (pass === "sidik2003") {
            successLogin(pass);
        } else {
            msg.innerText = "Invalid password (Mock: sidik2003)";
        }
        return;
    }

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'LOGIN', password: pass })
        });
        const result = await response.json();
        
        if (result.success) {
            successLogin(pass);
        } else {
            msg.innerText = result.message || "Unauthorized Access";
        }
    } catch (e) {
        msg.innerText = "Connection Error";
    }
}

function successLogin(pass) {
    adminPassword = pass;
    localStorage.setItem('adminPass', pass);
    document.getElementById('login-screen').classList.add('hidden');
    loadDashboardData();
}

function logout() {
    localStorage.removeItem('adminPass');
    window.location.reload();
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`${tab}-tab`).classList.remove('hidden');
    event.currentTarget.classList.add('active');
    currentTab = tab;
}

async function loadDashboardData() {
    const routes = ['projects', 'skills', 'experience', 'blog'];
    for (const route of routes) {
        try {
            const res = await fetch(`${CONFIG.API_URL}?route=${route}`);
            currentData[route] = await res.json();
        } catch (e) {
            currentData[route] = []; // Fallback to empty if API fails
        }
    }
    updateUI();
}

function updateUI() {
    // Stats
    document.getElementById('count-projects').innerText = currentData.projects.length;
    document.getElementById('count-skills').innerText = currentData.skills.length;
    document.getElementById('count-blog').innerText = currentData.blog.length;

    // Projects Table
    renderTable('projects', ['title', 'category']);
    renderTable('skills', ['skill', 'level']);
    renderTable('experience', ['company', 'role']);
    renderTable('blog', ['title', 'category']);
}

function renderTable(route, fields) {
    const body = document.getElementById(`${route}-table-body`);
    if (!body) return;
    
    body.innerHTML = currentData[route].map(item => `
        <tr>
            ${fields.map(f => `<td>${item[f]}</td>`).join('')}
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editItem('${route}', ${item.id})">Edit</button>
                <button class="btn btn-secondary btn-sm text-danger" onclick="deleteItem('${route}', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Modal & Form Handling
const modal = document.getElementById('modal');
const form = document.getElementById('admin-form');
const formFields = document.getElementById('form-fields');

function openModal(type, item = null) {
    currentRoute = type + (type === 'project' ? 's' : (type === 'skill' ? 's' : '')); // Simple route mapping
    if (type === 'blog') currentRoute = 'blog';
    if (type === 'experience') currentRoute = 'experience';

    editingId = item ? item.id : null;
    document.getElementById('modal-title').innerText = item ? `Edit ${type}` : `Add New ${type}`;
    
    let html = '';
    const fields = {
        project: ['title', 'description', 'image', 'tech', 'link', 'category'],
        skill: ['skill', 'level'],
        experience: ['company', 'role', 'year'],
        blog: ['title', 'image', 'content', 'category', 'date']
    };

    fields[type].forEach(f => {
        const val = item ? item[f] : '';
        if (f === 'content' || f === 'description') {
            html += `<label>${f}</label><textarea name="${f}">${val}</textarea>`;
        } else {
            html += `<label>${f}</label><input type="text" name="${f}" value="${val}">`;
        }
    });

    formFields.innerHTML = html;
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const payload = {
        action: editingId ? 'UPDATE' : 'CREATE',
        route: currentRoute,
        data: data,
        id: editingId,
        password: adminPassword
    };

    try {
        const res = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeModal();
            loadDashboardData();
            alert("Saved successfully!");
        }
    } catch (e) {
        alert("Error saving data. Please check connection and API URL.");
    }
};

async function deleteItem(route, id) {
    if (!confirm("Are you sure?")) return;
    
    try {
        const res = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'DELETE', route, id, password: adminPassword })
        });
        await res.json();
        loadDashboardData();
    } catch (e) {
        alert("Delete failed.");
    }
}

function editItem(route, id) {
    const item = currentData[route].find(i => i.id == id);
    let type = route === 'projects' ? 'project' : (route === 'skills' ? 'skill' : route);
    openModal(type, item);
}

