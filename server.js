const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'ecopulse-global-secret-key-2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CALCS_FILE = path.join(DATA_DIR, 'calculations.json');
const NOTIFS_FILE = path.join(DATA_DIR, 'notifications.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function initJSON(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

initJSON(USERS_FILE, []);
initJSON(CALCS_FILE, [
    { id: 1, origin: 'Mumbai', dest: 'Delhi', mode: 'rail', distance: 1400, weight: 10, co2: 392, energy: 1400, cost: 64000, rating: 'B', createdAt: new Date().toISOString() },
    { id: 2, origin: 'Bengaluru', dest: 'Chennai', mode: 'etruck', distance: 350, weight: 5, co2: 43.75, energy: 262.5, cost: 42000, rating: 'A+', createdAt: new Date().toISOString() },
    { id: 3, origin: 'Shanghai', dest: 'Rotterdam', mode: 'ship', distance: 19500, weight: 50, co2: 15600, energy: 48750, cost: 3120000, rating: 'A', createdAt: new Date().toISOString() }
]);

initJSON(NOTIFS_FILE, [
    { id: 1, title: 'Corridor Optimization', message: 'Switching Mumbai → Delhi freight to Indian Railways DFC saves 76% CO₂.', time: '15m ago', read: false },
    { id: 2, title: 'ESG Compliance Alert', message: 'Scope 3 Annual Emissions report updated for India corridors.', time: '1h ago', read: false }
]);

function readData(filePath) {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
    catch (err) { return []; }
}

function writeData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// REST API
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });

    const users = readData(USERS_FILE);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: 'usr_' + Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData(USERS_FILE, users);

    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar } });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const users = readData(USERS_FILE);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
});

app.get('/api/notifications', (req, res) => res.json(readData(NOTIFS_FILE)));

app.post('/api/notifications/read', (req, res) => {
    const notifs = readData(NOTIFS_FILE);
    notifs.forEach(n => n.read = true);
    writeData(NOTIFS_FILE, notifs);
    res.json({ message: 'Marked read' });
});

app.get('/api/calculations', (req, res) => res.json(readData(CALCS_FILE)));

app.post('/api/calculations', (req, res) => {
    const calcs = readData(CALCS_FILE);
    const newCalc = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    calcs.unshift(newCalc);
    writeData(CALCS_FILE, calcs);
    res.json(newCalc);
});

app.listen(PORT, () => console.log(`🌿 EcoPulse Server running on http://localhost:${PORT}`));
