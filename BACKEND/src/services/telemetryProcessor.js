const supabase = require("../config/supabase");
const {
    analyzeSensors
} = require("./sensorEngine");

const { calculateRisk } =
    require("./riskEngine");

const { createAlert } =
    require("./alertService");

const { generateRecommendation } =
    require("./aiService");

async function processTelemetry(
    shipmentId
) {

    try {

        console.log(
            `🧠 Processing telemetry for ${shipmentId}...`
        );

        const { data: shipment, error: shipmentError } =
            await supabase
                .from("shipments")
                .select("*")
                .eq("shipment_id", shipmentId)
                .single();

        if (shipmentError || !shipment) {

            throw new Error(
                `Shipment ${shipmentId} not found`
            );

        }

        const { data: readings, error: telemetryError } =
            await supabase
                .from("telemetry")
                .select("*")
                .eq("shipment_id", shipmentId)
                .order("recorded_at", {
                    ascending: true
                })
                .limit(20);

        if (telemetryError) {

            throw new Error(
                telemetryError.message
            );

        }

        if (
            !readings ||
            readings.length === 0
        ) {

            console.log(
                "No telemetry available"
            );

            return null;

        }

        const minTemp =
            Number(
                shipment.min_temperature
            );

        const maxTemp =
            Number(
                shipment.max_temperature
            );

        const risk =
            calculateRisk(
                readings,
                minTemp,
                maxTemp
            );

        const latestReading =
               readings[readings.length - 1];

            const sensorAnalysis =
    analyzeSensors({

        indoorTemperature:
            latestReading.indoor_temperature ??
            latestReading.temperature,

        outdoorTemperature:
            latestReading.outdoor_temperature,

        humidity:
            latestReading.humidity,

        doorOpen:
            latestReading.door_open,

        doorOpenSeconds:
            latestReading.door_open_seconds ?? 0,

        batteryLevel:
            latestReading.battery_level

    });

        console.log(
            "🧠 Risk:",
            risk
        );

        const generatedAlert =
            await createAlert(
                shipmentId,
                risk
            );

        let recommendation = null;

        if (
            risk.status === "WARNING" ||
            risk.status === "CRITICAL" ||
            risk.status === "EXCURSION"
        ) {

            recommendation =
                await generateRecommendation({

                    shipmentId,

                    productName:
                        shipment.product_name,

                    currentTemperature:
                        risk.currentTemperature,

                    minTemperature:
                        minTemp,

                    maxTemperature:
                        maxTemp,

                    trend:
                        risk.trend,

                    rateOfChange:
                        risk.rateOfChange,

                    riskScore:
                        risk.riskScore,

                    status:
                        risk.status,

                    predictedMinutes:
                        risk.predictedMinutes

                });

            console.log(
                "🤖 AI recommendation generated"
            );

        }

        return {

            shipmentId,

            risk,

                sensorAnalysis,


            alert: generatedAlert,

            recommendation

        };

    }

    catch (error) {

        console.error(
            "❌ Telemetry processing failed:",
            error.message
        );

        throw error;

    }

}

module.exports = {
    processTelemetry
};
