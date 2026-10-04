const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


async function generateRecommendation(data) {

    const prompt = `
You are ColdSense AI, an intelligent cold-chain
monitoring assistant.

Your job is to provide concise and practical
operator guidance when temperature-sensitive
shipments are at risk.

Shipment:
Product: ${data.productName}
Shipment ID: ${data.shipmentId}

Temperature:
Current: ${data.currentTemperature}°C
Safe range: ${data.minTemperature}°C to ${data.maxTemperature}°C

Telemetry:
Trend: ${data.trend}
Rate of change: ${data.rateOfChange}°C/min

Risk:
Risk score: ${data.riskScore}/100
Status: ${data.status}

Prediction:
Predicted upper-limit crossing:
${data.predictedMinutes ?? "Not available"} minutes

Provide:

1. A one-sentence explanation of the risk.
2. The most important immediate action.
3. One fallback action if the temperature continues to rise.

Keep the response concise and suitable for a
cold-chain operator dashboard.

Do not invent sensor readings or information.
Do not give medical advice.
`;


    const completion =
        await groq.chat.completions.create({

            messages: [
                {
                    role: "system",
                    content:
                        "You are a professional cold-chain monitoring assistant."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],

            model: "openai/gpt-oss-120b",

            temperature: 0.2,

            max_tokens: 250

        });


    return completion.choices[0].message.content;

}


module.exports = {
    generateRecommendation
};