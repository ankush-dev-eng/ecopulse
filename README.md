# 🌿 EcoPulse — AI-Powered Carbon Footprint Calculator

An immersive, WebGL-powered sustainability platform that combines a stunning scroll-driven 3D landing experience with a fully functional carbon footprint calculator and AI-powered recommendations.

![EcoPulse](https://img.shields.io/badge/EcoPulse-Planet%20Intelligence-00c853?style=for-the-badge&logo=leaflet&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)

## ✨ Features

### 🌍 Immersive Landing Experience
- **Procedural 3D Planet** — Stylized Earth with atmosphere glow, wireframe overlay, and orbiting energy arcs
- **Scroll-Driven Camera Orbit** — 360° smooth camera trajectory across a 900vh canvas
- **Environmental Particle System** — 700 green/blue particles with physics-based movement
- **Atmospheric Wave Shader** — GLSL shader background with scroll-reactive color migration
- **Editorial Typography** — Per-letter staggered blur-up reveals with Italiana + Outfit fonts
- **Custom Dual-Ring Cursor** — Interactive dot + smooth lerping outer ring

### 📊 Carbon Dashboard
- **Live Carbon Calculator** — Real-time Scope 1/2/3 emission calculations
- **Visual Breakdown** — Animated bar charts showing emission proportions
- **Executive Overview** — Carbon intensity, largest source, and reduction opportunities
- **AI Recommendations** — Gemini-powered actionable sustainability suggestions

### 🤖 AI Integration
- **Google Gemini 3.5 Flash** — Analyzes your emission profile and generates tailored recommendations
- **Graceful Fallback** — Works fully offline with client-side calculations; AI enhances when backend is available

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **3D Graphics** | Three.js (r0.160), WebGL Shaders (GLSL) |
| **Frontend** | Vanilla HTML/CSS/JS, Google Fonts |
| **Backend** | Node.js, Express |
| **AI** | Google Gemini 3.5 Flash API |
| **Architecture** | Single-page app, zero build step |

## 🚀 Quick Start

### Static Mode (No Backend)
Just open `index.html` in any modern browser — the landing page and carbon calculator work fully offline.

```bash
# Clone the repository
git clone https://github.com/ankush-dev-eng/ecopulse.git
cd ecopulse

# Open directly
start index.html    # Windows
open index.html     # macOS
```

### Full Mode (With AI Backend)

```bash
# Install dependencies
npm install

# Set your Gemini API key
# Create a .env file:
echo GEMINI_API_KEY=your_api_key_here > .env

# Start the server
npm start
```

Then visit [http://localhost:3000](http://localhost:3000)

## 📐 Emission Factors

The calculator uses these standard emission factors:

| Source | Factor | Unit |
|--------|--------|------|
| Diesel/Fuel | 2.68 | kg CO₂e/litre |
| Electricity | 0.70 | kg CO₂e/kWh |
| Road Freight | 0.11 | kg CO₂e/tonne-km |
| Air Freight | 0.60 | kg CO₂e/tonne-km |
| Waste | 0.50 | kg CO₂e/kg |

## 📁 Project Structure

```
ecopulse/
├── index.html          # Full landing page + dashboard (self-contained)
├── server.js           # Express backend with Gemini AI integration
├── package.json        # Node.js dependencies
├── gemini_demo.js      # Standalone Gemini API demo script
├── .gitignore          # node_modules, .env
└── .env                # API keys (not committed)
```

## 🔗 Connected Projects

- [ecopulse](https://github.com/ankush-dev-eng/ecopulse)
- [pulsecheck-ai](https://github.com/ankush-dev-eng/pulsecheck-ai)
- [ankush-dev-eng](https://github.com/ankush-dev-eng/ankush-dev-eng)

## 📄 License

Designed & Developed with ❤️ by [Ankush Shahu (@ankush-dev-eng)](https://github.com/ankush-dev-eng)
