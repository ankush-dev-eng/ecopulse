document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initTypewriter();
    initScrollEffects();
    initCharts();
    initCalculator();
    initAI();
    initExport();
    
    document.getElementById('year').textContent = new Date().getFullYear();
    document.getElementById('report-date').textContent += new Date().toLocaleDateString();
});

// Particle System
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for(let i=0; i<50; i++){
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * -1 - 0.5,
            speedX: Math.random() * 1 - 0.5,
            opacity: Math.random() * 0.5 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00e676';
        
        particles.forEach(p => {
            p.y += p.speedY;
            p.x += Math.sin(p.y * 0.01) + p.speedX;
            if(p.y < 0) {
                p.y = canvas.height;
                p.x = Math.random() * canvas.width;
            }
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// Typewriter
function initTypewriter() {
    const text = "Track, optimize, and report your carbon footprint.";
    const el = document.getElementById('typewriter');
    let i = 0;
    function type() {
        if(i < text.length) {
            el.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    setTimeout(type, 500);
}

// Scroll Effects & Intersection Observer
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
            navbar.classList.add('scrolled');
            backToTop.classList.add('visible');
        } else {
            navbar.classList.remove('scrolled');
            backToTop.classList.remove('visible');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if(scrollY >= sectionTop - 200) current = section.getAttribute('id');
        });

        navLinks.forEach(a => {
            a.classList.remove('active');
            if(a.getAttribute('href').includes(current)) a.classList.add('active');
        });
    });

    backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
                if(entry.target.id === 'dashboard') animateCounters();
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(sec => observer.observe(sec));
}

// Animated Counters
let countersAnimated = false;
function animateCounters() {
    if(countersAnimated) return;
    countersAnimated = true;
    
    const counters = [
        { id: 'stat-saved', target: 4520 },
        { id: 'stat-shipments', target: 128 },
        { id: 'stat-money', target: 12500 }
    ];

    counters.forEach(c => {
        const el = document.getElementById(c.id);
        let count = 0;
        const inc = c.target / 100;
        const interval = setInterval(() => {
            count += inc;
            if(count >= c.target) {
                el.innerText = c.target.toLocaleString();
                clearInterval(interval);
            } else {
                el.innerText = Math.floor(count).toLocaleString();
            }
        }, 20);
    });
}

// Calculator
const factors = { air: 0.602, truck: 0.096, ev: 0.025, rail: 0.028, ship: 0.016 };
let compChart;

function initCalculator() {
    const weightSlider = document.getElementById('weight');
    const weightVal = document.getElementById('weight-val');
    const modeCards = document.querySelectorAll('.mode-card');
    let currentMode = 'air';

    weightSlider.addEventListener('input', e => weightVal.textContent = e.target.value);

    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            modeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentMode = card.dataset.mode;
            
            const icons = { air: 'fa-plane', ship: 'fa-ship', rail: 'fa-train', truck: 'fa-truck', ev: 'fa-truck-fast' };
            const vIcon = document.getElementById('vehicle-icon');
            vIcon.className = `fas ${icons[currentMode]} route-vehicle`;
        });
    });

    document.getElementById('calc-btn').addEventListener('click', () => {
        createRipple(event);
        const distance = 5567; // Mock fixed distance for demo
        const weight = document.getElementById('weight').value;
        const co2 = (distance * weight * factors[currentMode]).toFixed(0);
        
        // Animate result
        const totalEl = document.getElementById('total-co2');
        totalEl.innerHTML = `${co2} <small>kg CO₂</small>`;
        
        // Rating
        const maxCo2 = distance * weight * factors.air;
        const ratio = co2 / maxCo2;
        let rating = 'A', color = 'var(--primary)';
        if(ratio > 0.8) { rating = 'F'; color = 'var(--danger)'; }
        else if(ratio > 0.5) { rating = 'D'; color = 'var(--danger)'; }
        else if(ratio > 0.2) { rating = 'C'; color = 'var(--amber)'; }
        else if(ratio > 0.1) { rating = 'B'; color = 'var(--accent)'; }
        
        const circle = document.getElementById('rating-circle');
        document.getElementById('rating-text').textContent = rating;
        document.getElementById('rating-text').style.color = color;
        circle.style.background = `conic-gradient(${color} ${100 - (ratio*100)}%, rgba(255,255,255,0.1) 0%)`;

        updateCompChart(distance, weight);
        showToast('Calculation complete!', 'success');
    });
}

function updateCompChart(dist, weight) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    const data = Object.values(factors).map(f => dist * weight * f);
    
    if(compChart) compChart.destroy();
    
    compChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Air', 'Truck', 'EV', 'Rail', 'Ship'],
            datasets: [{
                label: 'kg CO₂',
                data: data,
                backgroundColor: ['#ff5252', '#ffc107', '#00e676', '#00bcd4', '#00bcd4'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#fff' } } }
        }
    });
}

// Charts
function initCharts() {
    Chart.defaults.color = '#fff';
    Chart.defaults.font.family = 'Inter';

    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Emissions (t)',
                data: [65, 59, 80, 81, 56, 55],
                borderColor: '#00e676',
                backgroundColor: 'rgba(0, 230, 118, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    new Chart(document.getElementById('energyChart'), {
        type: 'doughnut',
        data: {
            labels: ['Renewable', 'Fossil'],
            datasets: [{
                data: [75, 25],
                backgroundColor: ['#00e676', '#333'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// AI Advisor
function initAI() {
    document.getElementById('generate-ai-btn').addEventListener('click', function(e) {
        createRipple(e);
        const box = document.getElementById('chat-box');
        
        // Typing indicator
        const typingId = 'typing-' + Date.now();
        box.innerHTML += `
            <div class="chat-msg" id="${typingId}">
                <div class="chat-avatar"><i class="fas fa-robot"></i></div>
                <div class="chat-bubble">...</div>
            </div>
        `;
        box.scrollTop = box.scrollHeight;

        setTimeout(() => {
            document.getElementById(typingId).remove();
            box.innerHTML += `
                <div class="chat-msg">
                    <div class="chat-avatar"><i class="fas fa-robot"></i></div>
                    <div class="chat-bubble">
                        Switching your London -> NYC route from Air to Ocean will increase transit time by 12 days but save <strong>4,200 kg CO₂</strong> and reduce costs by 65%.
                        <div class="ai-actions">
                            <button class="btn-sm accept" onclick="acceptAI(this)">Accept Change</button>
                            <button class="btn-sm" onclick="this.parentElement.parentElement.parentElement.remove()">Dismiss</button>
                        </div>
                    </div>
                </div>
            `;
            box.scrollTop = box.scrollHeight;
        }, 1500);
    });
}

window.acceptAI = function(btn) {
    showToast('Optimization applied successfully!', 'success');
    btn.parentElement.parentElement.parentElement.remove();
}

// Utilities
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--primary)"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    const ripple = button.querySelector('.ripple');
    if (ripple) ripple.remove();
    button.appendChild(circle);
}

// Exports
function initExport() {
    document.getElementById('btn-pdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const company = document.getElementById('company-name').value || 'Your Company';
        
        doc.setFontSize(22);
        doc.setTextColor(0, 230, 118);
        doc.text('EcoPulse ESG Report', 20, 20);
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Company: ${company}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
        
        doc.text('Emissions Summary:', 20, 70);
        doc.text('- Total Scope 3: 12.4t CO2', 30, 80);
        doc.text('- Overall Grade: B+', 30, 90);
        
        doc.save('EcoPulse-Report.pdf');
        showToast('PDF Downloaded');
    });

    document.getElementById('btn-csv').addEventListener('click', () => {
        const csv = "Date,Mode,Origin,Destination,Weight,CO2_kg\n2023-10-01,Air,NYC,LDN,5,1245";
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'emissions.csv');
        a.click();
        showToast('CSV Exported');
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if(e.key.toLowerCase() === 'c' && e.target.tagName !== 'INPUT') {
        document.getElementById('simulator').scrollIntoView();
    }
    if(e.key.toLowerCase() === 'd' && e.target.tagName !== 'INPUT') {
        document.getElementById('dashboard').scrollIntoView();
    }
});
