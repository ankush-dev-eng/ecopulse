require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// CORS for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ecopulse', aiEnabled: !!process.env.GEMINI_API_KEY });
});

// API endpoint for Gemini-powered carbon footprint analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { fuel, electricity, freight, air, waste, recycled } = req.body;

        // Calculate emissions using standard factors
        const scope1 = (fuel || 0) * 2.68;
        const scope2 = (electricity || 0) * 0.70;
        const scope3 = (freight || 0) * 0.11 + (air || 0) * 0.60 + (waste || 0) * 0.50 * (1 - (recycled || 0) / 100);
        const total = scope1 + scope2 + scope3;

        // Fallback recommendations (used if Gemini is unavailable)
        const fallbackRecs = [
            { title: 'Reduce direct fuel', description: 'Review vehicle routes, loading efficiency and fuel-intensive operations first.', impact: 'high', savings: `${Math.round(scope1 * 0.15)} kg CO₂e` },
            { title: 'Optimize electricity', description: 'Prioritize renewable electricity and high-consumption equipment for Scope 2 reductions.', impact: 'medium', savings: `${Math.round(scope2 * 0.5)} kg CO₂e` },
            { title: 'Rethink freight', description: 'Compare road and air freight choices and consolidate loads where operationally possible.', impact: 'medium', savings: `${Math.round(scope3 * 0.2)} kg CO₂e` },
            { title: 'Increase circularity', description: 'Raising the recycled share can reduce the waste-related portion of the estimate.', impact: 'low', savings: `${Math.round(scope3 * 0.1)} kg CO₂e` }
        ];

        // Try using Gemini for AI-powered recommendations
        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                success: true,
                emissions: { scope1, scope2, scope3, total },
                recommendations: fallbackRecs,
                aiPowered: false
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `As an environmental sustainability expert, analyze these carbon emissions and provide specific, actionable recommendations:

Scope 1 (Direct): ${scope1.toFixed(1)} kg CO₂e/month (from ${fuel || 0}L diesel/fuel)
Scope 2 (Electricity): ${scope2.toFixed(1)} kg CO₂e/month (from ${electricity || 0}kWh)
Scope 3 (Value Chain): ${scope3.toFixed(1)} kg CO₂e/month (from ${freight || 0}tkm road freight, ${air || 0}tkm air freight, ${waste || 0}kg waste at ${recycled || 0}% recycled)
Total: ${total.toFixed(1)} kg CO₂e/month

Provide exactly 4 recommendations in this JSON format:
[
  {"title": "...", "description": "...", "impact": "high/medium/low", "savings": "estimated kg CO₂e reduction"}
]

Focus on practical, implementable actions specific to their emission profile.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse AI recommendations
        let recommendations;
        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : fallbackRecs;
        } catch {
            recommendations = fallbackRecs;
        }

        res.json({
            success: true,
            emissions: { scope1, scope2, scope3, total },
            recommendations,
            aiPowered: true
        });
    } catch (error) {
        console.error('Analysis error:', error.message);

        const fuel = req.body.fuel || 0;
        const electricity = req.body.electricity || 0;
        const freight = req.body.freight || 0;
        const air = req.body.air || 0;
        const waste = req.body.waste || 0;
        const recycled = req.body.recycled || 0;

        const scope1 = fuel * 2.68;
        const scope2 = electricity * 0.70;
        const scope3 = freight * 0.11 + air * 0.60 + waste * 0.50 * (1 - recycled / 100);
        const total = scope1 + scope2 + scope3;

        res.json({
            success: true,
            emissions: { scope1, scope2, scope3, total },
            recommendations: [
                { title: 'Reduce direct fuel', description: 'Review vehicle routes, loading efficiency and fuel-intensive operations first.', impact: 'high', savings: `${Math.round(scope1 * 0.15)} kg CO₂e` },
                { title: 'Optimize electricity', description: 'Prioritize renewable electricity and high-consumption equipment for Scope 2 reductions.', impact: 'medium', savings: `${Math.round(scope2 * 0.5)} kg CO₂e` },
                { title: 'Rethink freight', description: 'Compare road and air freight choices and consolidate loads where operationally possible.', impact: 'medium', savings: `${Math.round(scope3 * 0.2)} kg CO₂e` },
                { title: 'Increase circularity', description: 'Raising the recycled share can reduce the waste-related portion of the estimate.', impact: 'low', savings: `${Math.round(scope3 * 0.1)} kg CO₂e` }
            ],
            aiPowered: false
        });
    }
});

app.listen(PORT, () => {
    console.log(`🌿 EcoPulse server running at http://localhost:${PORT}`);
    if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️  No GEMINI_API_KEY found — AI recommendations will use fallback mode.');
        console.log('   Set GEMINI_API_KEY in your .env file to enable Gemini AI.');
    }
});
