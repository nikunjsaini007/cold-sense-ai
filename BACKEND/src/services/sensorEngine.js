function calculateHumidityRisk(
    humidity,
    minHumidity = 40,
    maxHumidity = 70
) {

    if (humidity === null || humidity === undefined) {

        return {
            status: "UNKNOWN",
            score: 0,
            message: "Humidity data unavailable"
        };

    }

    if (
        humidity >= minHumidity &&
        humidity <= maxHumidity
    ) {

        return {
            status: "NORMAL",
            score: 0,
            message: "Humidity is within the safe range"
        };

    }

    const distance =
        humidity < minHumidity
            ? minHumidity - humidity
            : humidity - maxHumidity;

    if (distance >= 15) {

        return {
            status: "CRITICAL",
            score: 80,
            message:
                `Humidity is significantly outside the safe range (${humidity}%)`
        };

    }

    return {
        status: "WARNING",
        score: 40,
        message:
            `Humidity is outside the safe range (${humidity}%)`
    };

}

function calculateBatteryRisk(
    batteryLevel
) {

    if (
        batteryLevel === null ||
        batteryLevel === undefined
    ) {

        return {
            status: "UNKNOWN",
            score: 0,
            message: "Battery data unavailable"
        };

    }

    if (batteryLevel > 30) {

        return {
            status: "NORMAL",
            score: 0,
            message: "Sensor battery level is healthy"
        };

    }

    if (batteryLevel > 15) {

        return {
            status: "WARNING",
            score: 35,
            message:
                `Sensor battery is getting low (${batteryLevel}%)`
        };

    }

    if (batteryLevel > 5) {

        return {
            status: "CRITICAL",
            score: 70,
            message:
                `Sensor battery is critically low (${batteryLevel}%)`
        };

    }

    return {
        status: "CRITICAL",
        score: 90,
        message:
            `Sensor battery is critically low (${batteryLevel}%)`
    };

}

function calculateDoorRisk(
    doorOpen,
    doorOpenSeconds = 0
) {

    if (!doorOpen) {

        return {
            status: "NORMAL",
            score: 0,
            message: "Storage door is closed"
        };

    }

    if (doorOpenSeconds < 30) {

        return {
            status: "NORMAL",
            score: 5,
            message:
                `Door has been open for ${doorOpenSeconds} seconds`
        };

    }

    if (doorOpenSeconds < 60) {

        return {
            status: "WARNING",
            score: 35,
            message:
                `Door has remained open for ${doorOpenSeconds} seconds`
        };

    }

    if (doorOpenSeconds < 120) {

        return {
            status: "CRITICAL",
            score: 65,
            message:
                `Door has remained open for ${doorOpenSeconds} seconds`
        };

    }

    return {
        status: "CRITICAL",
        score: 90,
        message:
            `Door has remained open for ${doorOpenSeconds} seconds`
    };

}

function calculateEnvironmentRisk(
    indoorTemperature,
    outdoorTemperature
) {

    if (
        indoorTemperature === null ||
        outdoorTemperature === null ||
        indoorTemperature === undefined ||
        outdoorTemperature === undefined
    ) {

        return {
            status: "UNKNOWN",
            score: 0,
            temperatureDifference: null,
            message: "Environmental temperature data unavailable"
        };

    }

    const difference =
        Math.abs(
            outdoorTemperature -
            indoorTemperature
        );

    if (difference < 15) {

        return {
            status: "NORMAL",
            score: 0,
            temperatureDifference:
                Number(difference.toFixed(2)),
            message:
                "Environmental conditions are stable"
        };

    }

    if (difference < 25) {

        return {
            status: "WARNING",
            score: 10,
            temperatureDifference:
                Number(difference.toFixed(2)),
            message:
                "Large indoor/outdoor temperature difference detected"
        };

    }

    return {
        status: "WARNING",
        score: 15,
        temperatureDifference:
            Number(difference.toFixed(2)),
        message:
            "Very large indoor/outdoor temperature difference detected"
    };

}

function analyzeSensors({

    indoorTemperature,
    outdoorTemperature,
    humidity,
    doorOpen,
    doorOpenSeconds,
    batteryLevel,

    minHumidity = 40,
    maxHumidity = 70

}) {

    const humidityRisk =
        calculateHumidityRisk(
            humidity,
            minHumidity,
            maxHumidity
        );

    const batteryRisk =
        calculateBatteryRisk(
            batteryLevel
        );

    const doorRisk =
        calculateDoorRisk(
            doorOpen,
            doorOpenSeconds
        );

    const environmentRisk =
        calculateEnvironmentRisk(
            indoorTemperature,
            outdoorTemperature
        );

    const risks = [
        humidityRisk,
        batteryRisk,
        doorRisk,
        environmentRisk
    ];

    const criticalCount =
        risks.filter(
            risk => risk.status === "CRITICAL"
        ).length;

    const warningCount =
        risks.filter(
            risk => risk.status === "WARNING"
        ).length;

    let overallStatus = "NORMAL";

    if (criticalCount > 0) {

        overallStatus = "CRITICAL";

    }

    else if (warningCount > 0) {

        overallStatus = "WARNING";

    }

    return {

        overallStatus,

        humidity: humidityRisk,

        battery: batteryRisk,

        door: doorRisk,

        environment: environmentRisk

    };

}

module.exports = {

    calculateHumidityRisk,

    calculateBatteryRisk,

    calculateDoorRisk,

    calculateEnvironmentRisk,

    analyzeSensors

};
