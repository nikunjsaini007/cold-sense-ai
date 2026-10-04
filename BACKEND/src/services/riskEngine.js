function calculateRisk(readings, minTemp, maxTemp) {

    if (!readings || readings.length === 0) {
        return {
            status: "UNKNOWN",
            riskScore: 0,
            message: "Not enough telemetry data"
        };
    }

    const current = readings[readings.length - 1];

    const currentTemperature = Number(current.temperature);

    let trend = "STABLE";
    let rateOfChange = 0;



    if (readings.length >= 2) {

        const previous = readings[readings.length - 2];

        const previousTemperature =
            Number(previous.temperature);

        const currentTime =
            new Date(current.recorded_at).getTime();

        const previousTime =
            new Date(previous.recorded_at).getTime();

        const timeDifference =
            (currentTime - previousTime) / 60000;

        if (timeDifference > 0) {

            rateOfChange =
                (currentTemperature - previousTemperature)
                / timeDifference;

            if (rateOfChange > 0.01) {
                trend = "RISING";
            }

            else if (rateOfChange < -0.01) {
                trend = "FALLING";
            }

            else {
                trend = "STABLE";
            }
        }
    }



    let riskScore = 0;

    if (
        currentTemperature < minTemp ||
        currentTemperature > maxTemp
    ) {
        riskScore = 100;
    }

    else {

        const range = maxTemp - minTemp;

        const distanceFromUpperLimit =
            maxTemp - currentTemperature;

        const upperRisk =
            1 - (distanceFromUpperLimit / range);

        riskScore =
            Math.max(0, upperRisk * 60);
    }


    if (trend === "RISING") {

        riskScore += 20;

    }

    let predictedMinutes = null;

    let predictedExcursion = false;


    if (
        trend === "RISING" &&
        rateOfChange > 0 &&
        currentTemperature < maxTemp
    ) {

        const temperatureRemaining =
            maxTemp - currentTemperature;

        predictedMinutes =
            temperatureRemaining / rateOfChange;



        if (predictedMinutes <= 15) {

            predictedExcursion = true;

            riskScore += 20;

        }
    }




    riskScore =
        Math.min(100, Math.max(0, riskScore));


    let status;

    if (
        currentTemperature < minTemp ||
        currentTemperature > maxTemp
    ) {

        status = "EXCURSION";

    }

    else if (riskScore >= 75) {

        status = "CRITICAL";

    }

    else if (riskScore >= 40) {

        status = "WARNING";

    }

    else {

        status = "NORMAL";

    }



    return {

        currentTemperature,

        trend,

        rateOfChange:
            Number(rateOfChange.toFixed(3)),

        riskScore:
            Math.round(riskScore),

        status,

        predictedExcursion,

        predictedMinutes:
            predictedMinutes !== null
                ? Number(predictedMinutes.toFixed(1))
                : null

    };
}


module.exports = {
    calculateRisk
};