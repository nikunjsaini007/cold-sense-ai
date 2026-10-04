const axios = require("axios");

const API_URL = process.env.SIMULATOR_API_URL || "http://localhost:5000/api/telemetry";
const shipmentIds = (process.env.SIMULATOR_SHIPMENT_IDS || process.env.SIMULATOR_SHIPMENT_ID || "SHP001").split(",").map((id) => id.trim()).filter(Boolean);
const intervalMs = Math.max(5000, Number(process.env.SIMULATOR_INTERVAL_MS || 10000));
const configuredScenario = String(process.env.SIMULATOR_SCENARIO || "AUTO").toUpperCase();

const states = new Map(shipmentIds.map((shipmentId) => [shipmentId, {
    tick: 0,
    indoor: 5.4,
    outdoor: 31.2,
    humidity: 58,
    battery: 96,
    doorOpen: false,
    doorOpenSeconds: 0
}]));

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const drift = (value, target, amount) => value + clamp(target - value, -amount, amount);
const noise = (amount) => (Math.random() - 0.5) * amount;

function scenarioFor(state) {
    if (configuredScenario !== "AUTO") return configuredScenario;
    const cycle = state.tick % 72;
    if (cycle >= 12 && cycle <= 15) return "DOOR_OPEN";
    if (cycle >= 24 && cycle <= 38) return "WARMING";
    if (cycle >= 39 && cycle <= 49) return "EXCURSION";
    if (cycle >= 50 && cycle <= 64) return "RECOVERY";
    return "NORMAL";
}

function updateState(state) {
    state.tick += 1;
    const scenario = scenarioFor(state);
    state.outdoor = clamp(drift(state.outdoor, 33.2, 0.18) + noise(0.16), 25, 38);
    state.doorOpen = scenario === "DOOR_OPEN";
    state.doorOpenSeconds = state.doorOpen ? state.doorOpenSeconds + intervalMs / 1000 : 0;

    if (scenario === "WARMING" || scenario === "EXCURSION") {
        state.indoor += scenario === "EXCURSION" ? 0.18 + Math.random() * 0.05 : 0.10 + Math.random() * 0.04;
    } else if (scenario === "RECOVERY") {
        state.indoor -= 0.16 + Math.random() * 0.04;
    } else if (scenario === "DOOR_OPEN") {
        state.indoor += 0.07 + (state.outdoor - state.indoor) * 0.002 + Math.random() * 0.03;
    } else {
        state.indoor = drift(state.indoor, 5.8, 0.06) + noise(0.10);
    }
    state.indoor = clamp(state.indoor, 3.5, 9.2);
    const humidityTarget = state.doorOpen ? 65 : 59;
    state.humidity = clamp(drift(state.humidity, humidityTarget, 0.8) + noise(0.45), 45, 75);
    state.battery = clamp(state.battery - (scenario === "LOW_BATTERY" ? 0.35 + Math.random() * 0.15 : 0.015 + Math.random() * 0.025), 0, 100);
    return scenario;
}

async function sendTelemetry(shipmentId) {
    const state = states.get(shipmentId);
    const scenario = updateState(state);
    const payload = {
        shipmentId,
        temperature: Number(state.indoor.toFixed(2)),
        indoorTemperature: Number(state.indoor.toFixed(2)),
        outdoorTemperature: Number(state.outdoor.toFixed(2)),
        humidity: Number(state.humidity.toFixed(1)),
        doorOpen: state.doorOpen,
        doorOpenSeconds: Math.round(state.doorOpenSeconds),
        batteryLevel: Number(state.battery.toFixed(1))
    };
    try {
        const response = await axios.post(API_URL, payload);
        const risk = response.data?.processing?.risk;
        console.log(`[simulator] ${shipmentId} ${scenario} | indoor ${payload.indoorTemperature}°C | outdoor ${payload.outdoorTemperature}°C | humidity ${payload.humidity}% | door ${state.doorOpen ? "OPEN" : "CLOSED"} | battery ${payload.batteryLevel}% | risk ${risk?.status || "PENDING"}`);
    } catch (error) {
        console.error(`[simulator] ${shipmentId} failed:`, error.response?.data || error.message);
    }
}

function startRealisticSimulator() {
    console.log(`[simulator] SHP001-compatible telemetry started for ${shipmentIds.join(", ")} every ${intervalMs / 1000}s; scenario=${configuredScenario}`);
    shipmentIds.forEach((shipmentId) => void sendTelemetry(shipmentId));
    return setInterval(() => shipmentIds.forEach((shipmentId) => void sendTelemetry(shipmentId)), intervalMs);
}

module.exports = { startRealisticSimulator };
