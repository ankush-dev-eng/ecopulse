// --- Constants & Config ---
const EMISSION_RATES = {
    'air': 0.602,
    'truck': 0.096,
    'electric-truck': 0.025,
    'rail': 0.028,
    'ship': 0.016
};

// Simplified distance matrix (km)
const DISTANCES = {
    'New York-London': 5567,
    'London-Tokyo': 9559,
    'Shanghai-Rotterdam': 8920,
    'Dubai-Singapore': 5840,
    'Hamburg-Los Angeles': 9060,
    'Mumbai-New York': 12540,
    'Tokyo-Shanghai': 1760,
    'Los Angeles-Tokyo': 8800,
    'Rotterdam-Dubai': 5170,
    'Singapore-Mumbai': 3900
};

// --- DOM Elements ---
const weightSlider = document.getElementById('weight');
const weightVal = document.getElementById('weight-val');
const modeCards = document.querySelectorAll('.mode-card');
const calcBtn = document.getElementById('calc-btn');
const calcSpinner = document.getElementById('calc-spinner');
const resultsCard = document.getElementById('results-card');
const originSel = document.getElementById('origin');
const destSel = document.getElementById('destination');

let selectedMode = 'air';
let selectedRate = EMISSION_RATES['air'];

// --- Particles Background ---
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.animationDuration = (Math.random() * 5 + 3) + 's';
        particle.style.animationDelay = (Math.random() * 2) + 's';
        container.appendChild(particle);
    }
}
createParticles();

// --- Event Listeners ---
weightSlider.addEventListener('input', (e) => {
    weightVal.textContent = e.target.value;
});

modeCards.forEach(card => {
    card.addEventListener('click', () => {
        modeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedMode = card.dataset.mode;
        selectedRate = parseFloat(card.dataset.rate);
    });
});

calcBtn.addEventListener('click', calculateFootprint);

// --- Calculation Logic ---
function getDistance(origin, dest) {
    const key1 = `${origin}-${dest}`;
    const key2 = `${dest}-${origin}`;
    return DISTANCES[key1] || DISTANCES[key2] || Math.floor(Math.random() * 5000 + 1000); // fallback
}

function getRating(co2PerKg) {
    if (co2PerKg < 0.05) return { grade: 'A+', color: 'var(--accent-emerald)', border: 'var(--accent-emerald)' };
    if (co2PerKg < 0.1) return { grade: 'B', color: 'var(--accent-lime)', border: 'var(--accent-lime)' };
    if (co2PerKg < 0.2) return { grade: 'C', color: '#ffd54f', border: '#ffd54f' };
    if (co2PerKg < 0.5) return { grade: 'D', color: '#ffb74d', border: '#ffb74d' };
    return { grade: 'F', color: 'var(--danger-red)', border: 'var(--danger-red)' };
}

function calculateFootprint() {
    const origin = originSel.value;
    const dest = destSel.value;
    const weightKg = parseFloat(weightSlider.value);
    
    // Simulate loading
    calcSpinner.classList.remove('hidden');
    resultsCard.classList.add('hidden');
    
    setTimeout(() => {
        const distanceKm = getDistance(origin, dest);
        const weightTon = weightKg / 1000;
        
        // Math
        const totalCo2 = weightTon * distanceKm * selectedRate;
        const energyKwh = totalCo2 * 2.5; // arbitrary conversion for UI
        const cost = weightKg * 0.5 + distanceKm * 0.1; // arbitrary
        
        const co2PerKg = totalCo2 / weightKg;
        const rating = getRating(co2PerKg);
        
        // Update UI
        document.getElementById('res-co2').textContent = totalCo2.toFixed(1);
        document.getElementById('res-energy').textContent = energyKwh.toFixed(1);
        document.getElementById('res-cost').textContent = cost.toFixed(2);
        
        const ratingEl = document.getElementById('res-rating');
        const ratingBox = document.getElementById('rating-box');
        ratingEl.textContent = rating.grade;
        ratingEl.style.color = rating.color;
        ratingBox.style.borderColor = rating.border;
        
        calcSpinner.classList.add('hidden');
        resultsCard.classList.remove('hidden');
        
        // Generate AI Suggestion based on result
        generateAISuggestion(origin, dest, selectedMode, totalCo2);
        
    }, 800);
}

// --- Animated Counters ---
const counters = document.querySelectorAll('.counter');
const speed = 200;
counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / speed;
        if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 10);
        } else {
            counter.innerText = target.toLocaleString();
        }
    };
    
    // Intersection Observer to start animation when visible
    const observer = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting) {
            updateCount();
            observer.disconnect();
        }
    });
    observer.observe(counter);
});

// --- Chart.js ---
window.addEventListener('DOMContentLoaded', () => {
    Chart.defaults.color = '#adb5bd';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    // Bar Chart
    const ctxBar = document.getElementById('barChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Air', 'Truck', 'Rail', 'Ship', 'E-Truck'],
            datasets: [{
                label: 'CO₂ per ton-km (kg)',
                data: [0.602, 0.096, 0.028, 0.016, 0.025],
                backgroundColor: [
                    'rgba(255, 61, 0, 0.7)',
                    'rgba(255, 183, 77, 0.7)',
                    'rgba(118, 255, 3, 0.7)',
                    'rgba(0, 191, 165, 0.7)',
                    'rgba(0, 230, 118, 0.7)'
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, title: { display: true, text: 'Emissions by Transport Mode' } }
        }
    });

    // Doughnut Chart
    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Renewable', 'Fossil Fuels'],
            datasets: [{
                data: [45, 55],
                backgroundColor: ['#00e676', '#ffb74d'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: { title: { display: true, text: 'Fleet Energy Source' } }
        }
    });

    // Line Chart
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    const gradLine = ctxLine.createLinearGradient(0, 0, 0, 400);
    gradLine.addColorStop(0, 'rgba(0, 230, 118, 0.5)');
    gradLine.addColorStop(1, 'rgba(0, 230, 118, 0.0)');

    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Monthly CO₂ Footprint (tons)',
                data: [120, 115, 110, 105, 95, 90, 85, 88, 75, 70, 65, 50],
                borderColor: '#00e676',
                backgroundColor: gradLine,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { title: { display: true, text: 'Carbon Reduction Trend (2025)' } },
            scales: { y: { beginAtZero: true } }
        }
    });
    
    // Set report date
    document.getElementById('report-date').textContent = new Date().toLocaleDateString();
});

// --- AI Chat ---
function generateAISuggestion(origin, dest, mode, currentCo2) {
    const chatBox = document.getElementById('ai-chat');
    chatBox.innerHTML = ''; // Clear prev
    
    const msgs = [];
    
    if (mode === 'air') {
        const saved = (currentCo2 - (currentCo2 * (EMISSION_RATES['ship'] / EMISSION_RATES['air']))).toFixed(1);
        msgs.push({
            title: "Switch to Ocean Freight",
            desc: `Switching from Air to Ship for ${origin} to ${dest} could save ${saved} kg of CO₂ (-97%). Transit time increases by +18 days.`,
            action: "Apply Mode Change"
        });
    } else if (mode === 'truck') {
        const saved = (currentCo2 - (currentCo2 * (EMISSION_RATES['electric-truck'] / EMISSION_RATES['truck']))).toFixed(1);
        msgs.push({
            title: "Use EV Fleet",
            desc: `An electric truck is available for this route. Switch to save ${saved} kg CO₂ (-74%).`,
            action: "Switch to E-Truck"
        });
    } else {
        msgs.push({
            title: "Consolidate Shipments",
            desc: "You have 3 other shipments heading to the same destination this week. Consolidating them will increase route efficiency by 15%.",
            action: "Consolidate"
        });
    }

    msgs.forEach((msg, i) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'chat-msg';
            div.innerHTML = `
                <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="msg-bubble">
                    <div class="msg-title">${msg.title}</div>
                    <p>${msg.desc}</p>
                    <div class="msg-actions">
                        <button class="msg-btn btn-accept">${msg.action}</button>
                        <button class="msg-btn btn-dismiss">Dismiss</button>
                    </div>
                </div>
            `;
            chatBox.appendChild(div);
            
            // Add event listeners to buttons
            div.querySelector('.btn-dismiss').addEventListener('click', () => div.style.display = 'none');
            div.querySelector('.btn-accept').addEventListener('click', (e) => {
                e.target.textContent = 'Applied ✓';
                e.target.style.background = 'var(--accent-teal)';
            });
        }, i * 600);
    });
}

// Initial dummy chat
document.addEventListener('DOMContentLoaded', () => {
    generateAISuggestion('New York', 'London', 'air', 3351);
});

// --- Exports ---
document.getElementById('btn-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(10, 22, 40);
    doc.text("EcoPulse ESG Compliance Report", 20, 30);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text("Company: Acme Corp Logistics", 20, 48);
    
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary Metrics:", 20, 70);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("- Total CO2 Saved: 15,420 kg", 25, 80);
    doc.text("- Shipments Optimized: 892", 25, 90);
    doc.text("- Overall Eco-Rating: A", 25, 100);
    
    doc.text("Generated by EcoPulse AI engine.", 20, 280);
    
    doc.save("EcoPulse_Report.pdf");
});

document.getElementById('btn-csv').addEventListener('click', () => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Date,Metric,Value\n"
        + `${new Date().toLocaleDateString()},Total CO2 Saved,15420\n`
        + `${new Date().toLocaleDateString()},Shipments,892\n`
        + `${new Date().toLocaleDateString()},Rating,A\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ecopulse_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
