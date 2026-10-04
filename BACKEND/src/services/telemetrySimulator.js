const axios = require("axios");

const API_URL = "http://localhost:5000/api/telemetry";

// Use one shipment by default, or multiple comma-separated shipment IDs for
// local testing: SIMULATOR_SHIPMENT_IDS=SHP001,SHP004,SHP005.
const shipmentIds = (process.env.SIMULATOR_SHIPMENT_IDS || process.env.SIMULATOR_SHIPMENT_ID || "SHP001")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

let indoorTemperature = 5.2;
let outdoorTemperature = 30.5;
let humidity = 60;
let batteryLevel = 100;

let doorOpen = false;
let doorOpenTicks = 0;

let tick = 0;

function updateOutdoorTemperature() {

    outdoorTemperature +=
        (Math.random() - 0.5) * 0.4;

    outdoorTemperature =
        Math.max(
            25,
            Math.min(
                38,
                outdoorTemperature
            )
        );

}

function updateDoor() {

    if (tick >= 13 && tick <= 18) {

        doorOpen = true;

    }

    else {

        doorOpen = false;

    }

    if (doorOpen) {

        doorOpenTicks++;

    }

    else {

        doorOpenTicks = 0;

    }

}

function updateIndoorTemperature() {

    if (tick <= 12) {

        indoorTemperature +=
            (Math.random() - 0.5) * 0.08;

    }

    else if (tick <= 18) {

        indoorTemperature +=
            0.12 +
            Math.random() * 0.08;

    }

    else if (tick <= 28) {

        indoorTemperature -=
            0.10 +
            Math.random() * 0.05;

    }

    else if (tick <= 38) {

        indoorTemperature +=
            0.13 +
            Math.random() * 0.08;

    }

    else if (tick <= 45) {

        indoorTemperature +=
            0.18 +
            Math.random() * 0.08;

    }

    else if (tick <= 60) {

        indoorTemperature -=
            0.20 +
            Math.random() * 0.08;

    }

    else {

        indoorTemperature +=
            (Math.random() - 0.5) * 0.08;

    }

    indoorTemperature =
        Math.max(
            1,
            Math.min(
                12,
                indoorTemperature
            )
        );

}

function updateHumidity() {

    if (doorOpen) {

        humidity +=
            0.8 +
            Math.random() * 0.8;

    }

    else {

        humidity +=
            (Math.random() - 0.5) * 1.5;

    }

    humidity =
        Math.max(
            40,
            Math.min(
                85,
                humidity
            )
        );

}

function updateBattery() {

    batteryLevel -=
        0.05 +
        Math.random() * 0.05;

    batteryLevel =
        Math.max(
            0,
            batteryLevel
        );

}

function updateSensors() {

    tick++;

    updateOutdoorTemperature();

    updateDoor();

    updateIndoorTemperature();

    updateHumidity();

    updateBattery();

}

async function sendTelemetry(targetShipmentId = shipmentIds[0]) {

    updateSensors();

    const payload = {

        shipmentId: targetShipmentId,

        temperature:
            Number(
                indoorTemperature.toFixed(2)
            ),

        indoorTemperature:
            Number(
                indoorTemperature.toFixed(2)
            ),

        outdoorTemperature:
            Number(
                outdoorTemperature.toFixed(2)
            ),

        humidity:
            Number(
                humidity.toFixed(2)
            ),

        doorOpen,

        batteryLevel:
            Number(
                batteryLevel.toFixed(2)
            )

    };

    try {

        const response =
            await axios.post(
                API_URL,
                payload
            );

        const processing =
            response.data?.processing;

        const risk =
            processing?.risk;

        console.log(
            "\n--------------------------------"
        );

        console.log(
            `📡 Shipment: ${targetShipmentId}`
        );

        console.log(
            `🌡️ Indoor: ${payload.indoorTemperature}°C`
        );

        console.log(
            `☀️ Outdoor: ${payload.outdoorTemperature}°C`
        );

        console.log(
            `💧 Humidity: ${payload.humidity}%`
        );

        console.log(
            `🚪 Door: ${doorOpen ? "OPEN" : "CLOSED"}`
        );

        console.log(
            `🔋 Battery: ${payload.batteryLevel}%`
        );

        console.log(
            `⚠️ Risk: ${risk?.status || "UNKNOWN"}`
        );

        console.log(
            "--------------------------------"
        );

    }

    catch (error) {

        console.error(
            "\n❌ Simulator error:"
        );

        console.error(
            error.response?.data ||
            error.message
        );

    }

}

function startSimulator() {

    console.log(
        "\n========================================"
    );

    console.log(
        "📡 ColdSense IoT Simulator"
    );

    console.log(
        "========================================"
    );

    console.log(
        `Shipments: ${shipmentIds.join(", ")}`
    );

    console.log(
        "Interval: 5 seconds"
    );

    console.log(
        "Sensors:"
    );

    console.log(
        "🌡️ Indoor Temperature"
    );

    console.log(
        "☀️ Outdoor Temperature"
    );

    console.log(
        "💧 Humidity"
    );

    console.log(
        "🚪 Door Sensor"
    );

    console.log(
        "🔋 Battery"
    );

    console.log(
        "\nScenario:"
    );

    console.log(
        "NORMAL → DOOR EVENT → RECOVERY → REFRIGERATION PROBLEM → EXCURSION → RECOVERY"
    );

    console.log(
        "========================================\n"
    );

    shipmentIds.forEach((id) => sendTelemetry(id));

    setInterval(() => {
        shipmentIds.forEach((id) => sendTelemetry(id));
    }, 5000);

}

module.exports = {
    startSimulator
};
