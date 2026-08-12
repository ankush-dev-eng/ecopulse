// Data & Constants
const EMISSION_FACTORS = {
    air: { co2: 0.602, energy: 2.1, cost: 5.5, rating: 'F', color: '#ff5252' },
    truck: { co2: 0.096, energy: 0.4, cost: 1.2, rating: 'D', color: '#ff9800' },
    rail: { co2: 0.028, energy: 0.1, cost: 0.8, rating: 'B', color: '#4caf50' },
    ship: { co2: 0.016, energy: 0.05, cost: 0.4, rating: 'A', color: '#00bcd4' },
    etruck: { co2: 0.025, energy: 0.15, cost: 1.5, rating: 'A+', color: '#00e676' }
};

const DISTANCES = {
    'New York-London': 5567,
    'Shanghai-Rotterdam': 19500,
    'Dubai-London': 5476,
    // Add defaults
    default: 3000
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
    const cost = tonKm * factor.cost;

    animateValue('res-co2', 0, co2, 1000);
    animateValue('res-energy', 0, energy, 1000);
    animateValue('res-cost', 0, cost, 1000);
    
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
        const mCost = tonKm * f.cost;
        
        const tr = document.createElement('tr');
        if(mode === currentMode) tr.classList.add('highlight');
        
        tr.innerHTML = `
            <td>${mode.charAt(0).toUpperCase() + mode.slice(1)}</td>
            <td>${mCo2.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
            <td>${mEnergy.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
            <td>$${mCost.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
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
        { title: 'Route Optimization', text: 'Switching Shanghai → Rotterdam from Air to Ship saves 97% CO₂.', savings: '97% CO₂' },
        { title: 'Electrification', text: 'Upgrade local delivery fleet to E-Trucks to reduce urban emissions.', savings: '74% CO₂' }
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
        showToast('Analyzing logistics data...');
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'ai-message';
            div.innerHTML = `
                <div class="ai-avatar">🤖</div>
                <div class="ai-bubble glass">
                    <h4>Consolidation <span class="badge-savings">15% Cost</span></h4>
                    <p>Combine shipments from London to New York to maximize load factor.</p>
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
        doc.text("Acme Corp Logistics - ESG Report", 20, 20);
        doc.setFontSize(12);
        doc.text("Generated: " + new Date().toLocaleDateString(), 20, 30);
        doc.text("Overall Rating: A-", 20, 40);
        doc.text("Scope 3 Emissions: 2,450 tCO2e", 20, 50);
        doc.save("ESG_Report.pdf");
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
}
