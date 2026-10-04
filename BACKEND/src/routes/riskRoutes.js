const express = require("express");

const supabase = require("../config/supabase");

const { calculateRisk } =
    require("../services/riskEngine");

const { createAlert } =
    require("../services/alertService");

const { generateRecommendation } =
    require("../services/aiService");

const { analyzeSensors } =
    require("../services/sensorEngine");

const router = express.Router();

router.get("/:shipmentId", async (req, res) => {

    try {

        const { shipmentId } = req.params;

        const { data: shipment, error: shipmentError } =
            await supabase
                .from("shipments")
                .select("*")
                .eq("shipment_id", shipmentId)
                .single();

        if (shipmentError || !shipment) {

            return res.status(404).json({
                message: "Shipment not found",
                shipmentId
            });

        }

        const minTemp =
            Number(shipment.min_temperature);

        const maxTemp =
            Number(shipment.max_temperature);

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

            return res.status(500).json({
                message: "Failed to fetch telemetry",
                error: telemetryError.message
            });

        }

        if (!readings || readings.length === 0) {

            return res.json({
                shipment: {
                    shipmentId: shipment.shipment_id,
                    productName: shipment.product_name,
                    productType: shipment.product_type || "OTHER",
                    origin: shipment.origin,
                    destination: shipment.destination
                },
                safeRange: { min: minTemp, max: maxTemp },
                telemetryAvailable: false,
                telemetry: {
                    readingsAnalyzed: 0,
                    latestTemperature: null,
                    latestHumidity: null,
                    latestReadingAt: null,
                    history: []
                },
                risk: {
                    currentTemperature: null,
                    trend: "WAITING",
                    rateOfChange: 0,
                    riskScore: 0,
                    status: "WAITING",
                    predictedExcursion: false,
                    predictedMinutes: null
                },
                alert: null,
                recommendation: "Waiting for the first telemetry reading for this shipment."
            });

        }

        const risk =
            calculateRisk(
                readings,
                minTemp,
                maxTemp
            );

        const generatedAlert =
            await createAlert(
                shipmentId,
                risk
            );

        const latestReading = readings[readings.length - 1];
        const sensorAnalysis = analyzeSensors({
            indoorTemperature: latestReading.indoor_temperature ?? latestReading.temperature,
            outdoorTemperature: latestReading.outdoor_temperature ?? null,
            humidity: latestReading.humidity ?? null,
            doorOpen: latestReading.door_open ?? false,
            doorOpenSeconds: latestReading.door_open_seconds ?? 0,
            batteryLevel: latestReading.battery_level ?? null
        });

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

        }

        res.json({

            shipment: {

                shipmentId:
                    shipment.shipment_id,

                productName:
                    shipment.product_name,

                productType:
                    shipment.product_type || "OTHER",

                origin:
                    shipment.origin,

                destination:
                    shipment.destination

            },

            safeRange: {

                min: minTemp,

                max: maxTemp

            },

            telemetry: {

                readingsAnalyzed:
                    readings.length,

                latestTemperature:
                    readings[readings.length - 1].temperature,

                latestHumidity:
                    readings[readings.length - 1].humidity,

                latestReadingAt:
                    readings[readings.length - 1].recorded_at,

                history: readings.map((reading) => ({
                    temperature: Number(reading.temperature),
                    humidity: reading.humidity === null ? null : Number(reading.humidity),
                    recordedAt: reading.recorded_at
                }))

            },

            sensors: {
                indoorTemperature: latestReading.indoor_temperature ?? latestReading.temperature,
                outdoorTemperature: latestReading.outdoor_temperature ?? null,
                humidity: latestReading.humidity ?? null,
                doorOpen: latestReading.door_open ?? false,
                doorOpenSeconds: latestReading.door_open_seconds ?? 0,
                batteryLevel: latestReading.battery_level ?? null,
                analysis: sensorAnalysis
            },

            risk,

            alert: generatedAlert,

            recommendation

        });

    }

    catch (error) {

        console.error(
            "Risk analysis error:",
            error
        );

        res.status(500).json({

            message: "Risk analysis failed",

            error: error.message

        });

    }

});

module.exports = router;
