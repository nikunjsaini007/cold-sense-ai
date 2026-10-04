const express = require("express");
const { generateRecommendation } = require("../services/aiService");

const router = express.Router();

router.post("/recommendation", async (req, res) => {
    try {
        const required = [
            "shipmentId",
            "productName",
            "currentTemperature",
            "minTemperature",
            "maxTemperature",
            "trend",
            "rateOfChange",
            "riskScore",
            "status"
        ];

        const missing = required.filter((field) => req.body[field] === undefined || req.body[field] === null);
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing AI input: ${missing.join(", ")}` });
        }

        const recommendation = await generateRecommendation(req.body);
        return res.json({ recommendation, generatedAt: new Date().toISOString() });
    } catch (error) {
        console.error("AI recommendation error:", error);
        return res.status(500).json({ message: "AI recommendation failed", error: error.message });
    }
});

module.exports = router;
