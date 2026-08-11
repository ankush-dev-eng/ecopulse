# 🌿 EcoPulse - AI-Powered Sustainable Supply Chain & Carbon Calculator

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**EcoPulse** is a premium, glassmorphic dark-themed analytics dashboard designed to help companies track, calculate, and optimize their carbon footprint across global supply chains.

## 🌍 The Problem
Global logistics contribute significantly to greenhouse gas emissions. Companies lack intuitive, data-driven tools to visualize their carbon output and find actionable, green alternatives. 

## ✨ Features
- 🧮 **Interactive Carbon Calculator**: Calculate CO₂ emissions, energy consumption, and estimated costs based on origin, destination, cargo weight, and transport mode.
- 🎨 **Premium Glassmorphic UI**: Beautiful dark theme with glowing accents, animated particles, and smooth transitions.
- 📊 **Real-time Carbon Dashboard**: Visualize emissions data with responsive Chart.js graphs (Bar, Doughnut, Line charts).
- 🤖 **AI Green Optimizer**: Chat-style interface that provides smart recommendations (e.g., switching from air to ocean freight) to reduce emissions based on real-time calculations.
- 📄 **ESG Compliance Reports**: Generate and download PDF or CSV reports instantly using `jsPDF`.

## 📸 Screenshots
*(Coming soon)*

## 🛠️ Tech Stack
| Technology | Description |
|------------|-------------|
| **HTML5/CSS3** | Core structure and styling (CSS Custom Properties, Flexbox/Grid) |
| **JavaScript** | Logic, math, DOM manipulation |
| **Chart.js** | Data visualization |
| **jsPDF** | Client-side PDF generation |
| **FontAwesome**| UI Icons |

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/ankushcseiot-50/ecopulse.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ecopulse
   ```
3. Open `index.html` in your favorite browser. No build steps or local server required!

## 🧮 How the Carbon Calculator Works
The tool uses approximate emission factors per ton-km:
- **✈️ Air**: 0.602 kg CO₂/ton-km
- **🚛 Truck**: 0.096 kg CO₂/ton-km
- **⚡ E-Truck**: 0.025 kg CO₂/ton-km
- **🚂 Rail**: 0.028 kg CO₂/ton-km
- **🚢 Ship**: 0.016 kg CO₂/ton-km

*Math*: `(Weight in kg / 1000) * Distance in km * Emission Factor`

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
[MIT](LICENSE)

---
*Made with 🌿 by ankushcseiot-50*
