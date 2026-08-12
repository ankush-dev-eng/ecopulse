// Data & Constants
const EMISSION_FACTORS = {
    air: { co2: 0.602, energy: 2.1, cost: 5.5, rating: 'F', color: '#ff5252' },
    truck: { co2: 0.096, energy: 0.4, cost: 1.2, rating: 'D', color: '#ff9800' },
    rail: { co2: 0.028, energy: 0.1, cost: 0.8, rating: 'B', color: '#4caf50' },
    ship: { co2: 0.016, energy: 0.05, cost: 0.4, rating: 'A', color: '#00bcd4' },
    etruck: { co2: 0.025, energy: 0.15, cost: 1.5, rating: 'A+', color: '#00e676' }
};

const DISTANCES = {
    'Mumbai-Delhi': 1400,
    'Mumbai-Bengaluru': 980,
    'Delhi-Kolkata': 1500,
    'Chennai-Bengaluru': 350,
    'Ahmedabad-Mumbai': 530,
    'Hyderabad-Mumbai': 710,
    'Kolkata-Chennai': 1660,
    'Pune-Mumbai': 150,
    'Surat-Mumbai': 280,
    'Kochi-Chennai': 690,
    default: 850
};

let currentMode = 'air';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initSimulator();
    initCharts();
    initCounters();
    initAI();
    initMisc();
});

function getDistance(origin, dest) {
    const key = `${origin}-${dest}`;
    const reverseKey = `${dest}-${origin}`;
    return DISTANCES[key] || DISTANCES[reverseKey] || DISTANCES.default;
}

function initSimulator() {
    const modeCards = document.querySelectorAll('.mode-card');
    const weightSlider = document.getElementById('weight');
    const weightVal = document.getElementById('weight-val');
    const calcBtn = document.getElementById('calculate-btn');

    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            modeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentMode = card.dataset.mode;
        });
    });

    weightSlider.addEventListener('input', (e) => {
        weightVal.textContent = e.target.value;
        const percent = ((e.target.value - e.target.min) / (e.target.max - e.target.min)) * 100;
        e.target.style.background = `linear-gradient(to right, var(--accent-emerald) ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
    });

    calcBtn.addEventListener('click', calculateImpact);
}

function calculateImpact() {
    const origin = document.getElementById('origin').value;
    const dest = document.getElementById('destination').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const distance = getDistance(origin, dest);
    
    const resultsContainer = document.getElementById('results');
    resultsContainer.classList.remove('hidden');

    // Calculate for current mode
    const factor = EMISSION_FACTORS[currentMode];
    const tonKm = weight * distance;
    const co2 = tonKm * factor.co2;
    const energy = tonKm * factor.energy;
    const costInRupees = tonKm * factor.cost * 80; // convert to INR

    animateValue('res-co2', 0, co2, 1000);
    animateValue('res-energy', 0, energy, 1000);
    animateValue('res-cost', 0, costInRupees, 1000);
    
    document.getElementById('res-rating').textContent = factor.rating;
    
    // Update circle color
    let deg = 0;
    if(factor.rating.includes('A')) deg = 100;
    else if(factor.rating === 'B') deg = 80;
    else if(factor.rating === 'C') deg = 60;
    else if(factor.rating === 'D') deg = 40;
    else deg = 20;

    const circle = document.getElementById('eco-rating-circle');
    circle.style.background = `conic-gradient(${factor.color} ${deg * 3.6}deg, rgba(255,255,255,0.1) 0%)`;
    
    // Populate comparison table
    const tbody = document.getElementById('comparison-body');
    tbody.innerHTML = '';
    
    Object.entries(EMISSION_FACTORS).forEach(([mode, f]) => {
        const mCo2 = tonKm * f.co2;
        const mEnergy = tonKm * f.energy;
        const mCost = tonKm * f.cost * 80;
        
        const tr = document.createElement('tr');
        if(mode === currentMode) tr.classList.add('highlight');
        
        tr.innerHTML = `
            <td>${mode.charAt(0).toUpperCase() + mode.slice(1)}</td>
            <td>${mCo2.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
            <td>${mEnergy.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
            <td>₹${mCost.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
            <td style="color:${f.color}; font-weight:bold;">${f.rating}</td>
        `;
        tbody.appendChild(tr);
    });

    // Save to local storage
    localStorage.setItem('lastCalc', JSON.stringify({origin, dest, weight, mode: currentMode, co2}));
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateValue(entry.target.id || Math.random().toString(), 0, target, 2000);
                entry.target.innerHTML = target;
                observer.unobserve(entry.target);
            }
        });
    });
    counters.forEach(c => {
        if(!c.id) c.id = 'cnt-' + Math.random().toString(36).substr(2, 9);
        observer.observe(c);
    });
}

function initCharts() {
    Chart.defaults.color = '#7a8599';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Air', 'Truck', 'Rail', 'Ship', 'E-Truck'],
            datasets: [{
                label: 'CO₂ Emissions (kg/ton-km)',
                data: [0.602, 0.096, 0.028, 0.016, 0.025],
                backgroundColor: ['#ff5252', '#ff9800', '#4caf50', '#00bcd4', '#00e676'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
        }
    });

    const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Fossil Fuels', 'Renewables', 'Nuclear'],
            datasets: [{
                data: [58, 32, 10],
                backgroundColor: ['#ff9800', '#00e676', '#00bcd4'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: { legend: { position: 'right' } }
        }
    });

    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const gradient = lineCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 230, 118, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 230, 118, 0)');

    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Total Emissions (tCO₂e)',
                data: [120, 115, 110, 105, 95, 90, 85, 80, 78, 75, 70, 65],
                borderColor: '#00e676',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
        }
    });
}

function initAI() {
    const msgs = [
        { title: 'Corridor Optimization', text: 'Switching Mumbai → Delhi freight from Highway Truck to Indian Railways Dedicated Freight Corridor (DFC) saves 76% CO₂.', savings: '76% CO₂' },
        { title: 'EV Fleet Transition', text: 'Transition urban last-mile delivery fleet in Bengaluru & Delhi NCR to Electric Cargo EVs.', savings: '68% CO₂' }
    ];

    const container = document.getElementById('chat-messages');
    
    msgs.forEach((msg, i) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'ai-message';
            div.innerHTML = `
                <div class="ai-avatar">🌱</div>
                <div class="ai-bubble glass">
                    <h4>${msg.title} <span class="badge-savings">${msg.savings}</span></h4>
                    <p>${msg.text}</p>
                    <div class="ai-actions">
                        <button class="btn btn-primary" onclick="acceptSuggestion(this)">Accept</button>
                        <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()">Dismiss</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }, i * 1000);
    });

    document.getElementById('generate-ai-btn').addEventListener('click', () => {
        showToast('Analyzing Indian logistics data...');
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'ai-message';
            div.innerHTML = `
                <div class="ai-avatar">🤖</div>
                <div class="ai-bubble glass">
                    <h4>Coastal Shipping Consolidation <span class="badge-savings">22% Cost</span></h4>
                    <p>Utilize coastal shipping routes from Mundra to Chennai Port to reduce diesel consumption.</p>
                    <div class="ai-actions">
                        <button class="btn btn-primary" onclick="acceptSuggestion(this)">Accept</button>
                        <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()">Dismiss</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }, 1500);
    });
}

window.acceptSuggestion = function(btn) {
    btn.textContent = 'Accepted ✓';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline');
    btn.style.color = 'var(--accent-emerald)';
    btn.style.borderColor = 'var(--accent-emerald)';
    btn.disabled = true;
    showToast('Optimization applied successfully!');
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="color:var(--accent-emerald)">✓</span> ${msg}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initMisc() {
    document.getElementById('current-date').textContent = new Date().toLocaleDateString();

    // PDF Export
    document.getElementById('download-pdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Tata Logistics India - ESG Report", 20, 20);
        doc.setFontSize(12);
        doc.text("Generated: " + new Date().toLocaleDateString(), 20, 30);
        doc.text("Overall Rating: A-", 20, 40);
        doc.text("Scope 3 Emissions: 2,450 tCO2e", 20, 50);
        doc.save("India_ESG_Report.pdf");
        showToast('PDF Downloaded');
    });

    // CSV Export
    document.getElementById('export-csv').addEventListener('click', () => {
        const csv = "Metric,Value\nOverall Rating,A-\nScope 3 Emissions,2450\nRenewable Share,42%";
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        a.click();
        showToast('CSV Exported');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'c' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
            document.getElementById('simulator').scrollIntoView({behavior: 'smooth'});
        }
    });

    // Scroll Navbar
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(8, 12, 21, 0.9)';
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            nav.style.background = 'rgba(8, 12, 21, 0.7)';
            nav.style.boxShadow = 'none';
        }
    });

    // Auth & Notifications Handlers
    initAuthAndNotifications();
}

function initAuthAndNotifications() {
    const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? 'http://localhost:3001' : '';
    let currentUser = JSON.parse(localStorage.getItem('eco_user')) || null;
    
    const notifBellBtn = document.getElementById('notif-bell-btn');
    const notifDrawer = document.getElementById('notifications-drawer');
    const drawerBody = document.getElementById('drawer-body');
    const markReadBtn = document.getElementById('mark-read-btn');
    
    const userWidget = document.getElementById('user-widget');
    const userNameDisplay = document.getElementById('user-name-display');
    const navLoginBtn = document.getElementById('nav-login-btn');
    
    const authModal = document.getElementById('auth-modal');
    const closeAuthModalBtn = document.getElementById('close-auth-modal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupBtn = document.getElementById('show-signup-btn');
    const showLoginBtn = document.getElementById('show-login-btn');

    function updateAuthUI() {
        if (currentUser) {
            userNameDisplay.textContent = currentUser.name || 'User';
            navLoginBtn.textContent = 'Sign Out';
        } else {
            userNameDisplay.textContent = 'Guest';
            navLoginBtn.textContent = 'Sign In';
        }
    }

    updateAuthUI();

    navLoginBtn.addEventListener('click', () => {
        if (currentUser) {
            if (confirm('Do you want to sign out?')) {
                localStorage.removeItem('eco_user');
                localStorage.removeItem('eco_token');
                currentUser = null;
                updateAuthUI();
            }
        } else {
            authModal.classList.add('active');
        }
    });

    closeAuthModalBtn.addEventListener('click', () => authModal.classList.remove('active'));

    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-pass').value;

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                currentUser = data.user;
                localStorage.setItem('eco_user', JSON.stringify(currentUser));
                localStorage.setItem('eco_token', data.token);
                updateAuthUI();
                authModal.classList.remove('active');
                showToast(`Welcome back, ${currentUser.name}!`);
            } else {
                showToast(data.error || 'Login failed');
            }
        } catch (err) {
            currentUser = { id: 'usr_local', name: email.split('@')[0], email };
            localStorage.setItem('eco_user', JSON.stringify(currentUser));
            updateAuthUI();
            authModal.classList.remove('active');
            showToast(`Signed in as ${currentUser.name} (Local Mode)`);
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-pass').value;

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                currentUser = data.user;
                localStorage.setItem('eco_user', JSON.stringify(currentUser));
                localStorage.setItem('eco_token', data.token);
                updateAuthUI();
                authModal.classList.remove('active');
                showToast(`Account created for ${currentUser.name}`);
            } else {
                showToast(data.error || 'Registration failed');
            }
        } catch (err) {
            currentUser = { id: 'usr_local', name, email };
            localStorage.setItem('eco_user', JSON.stringify(currentUser));
            updateAuthUI();
            authModal.classList.remove('active');
            showToast(`Account created for ${currentUser.name} (Local Mode)`);
        }
    });

    notifBellBtn.addEventListener('click', () => {
        notifDrawer.classList.toggle('hidden');
        if (!notifDrawer.classList.contains('hidden')) {
            fetchNotifications();
        }
    });

    async function fetchNotifications() {
        try {
            const res = await fetch(`${API_BASE}/api/notifications`);
            const data = await res.json();
            renderNotifs(data);
        } catch (err) {
            renderNotifs([
                { id: 1, title: 'Corridor Optimization 🇮🇳', message: 'Mumbai → Delhi Dedicated Freight Corridor saves 76% CO₂.', time: '15m ago', read: false },
                { id: 2, title: 'ESG Compliance Alert', message: 'Scope 3 Annual Emissions report updated for India corridors.', time: '1h ago', read: false }
            ]);
        }
    }

    function renderNotifs(items) {
        if (!items || items.length === 0) {
            drawerBody.innerHTML = '<div class="drawer-empty">No alerts</div>';
            return;
        }
        drawerBody.innerHTML = items.map(i => `
            <div class="drawer-item ${i.read ? 'read' : 'unread'}">
                <div class="di-title">${i.title}</div>
                <div class="di-msg">${i.message}</div>
                <div class="di-time">${i.time}</div>
            </div>
        `).join('');
        document.getElementById('notif-badge').textContent = items.filter(i => !i.read).length;
    }

    markReadBtn.addEventListener('click', async () => {
        try { await fetch(`${API_BASE}/api/notifications/read`, { method: 'POST' }); } catch(err){}
        document.querySelectorAll('.drawer-item').forEach(el => el.classList.replace('unread', 'read'));
        document.getElementById('notif-badge').textContent = '0';
    });
}
