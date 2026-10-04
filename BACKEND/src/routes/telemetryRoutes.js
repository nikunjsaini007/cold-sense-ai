const express = require("express");
const supabase = require("../config/supabase");

const {
    processTelemetry
} = require("../services/telemetryProcessor");

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const {
            shipmentId,
            temperature,
            humidity,
            indoorTemperature,
            outdoorTemperature,
            doorOpen,
            doorOpenSeconds,
            batteryLevel
        } = req.body;

        if (!shipmentId) {

            return res.status(400).json({
                message: "shipmentId is required"
            });

        }

        if (
            temperature === undefined ||
            temperature === null
        ) {

            return res.status(400).json({
                message: "temperature is required"
            });

        }

        const parsedTemperature =
            Number(temperature);

        const parsedHumidity =
            humidity !== undefined &&
            humidity !== null
                ? Number(humidity)
                : null;

        if (Number.isNaN(parsedTemperature)) {

            return res.status(400).json({
                message: "temperature must be a number"
            });

        }

        if (
            parsedHumidity !== null &&
            Number.isNaN(parsedHumidity)
        ) {

            return res.status(400).json({
                message: "humidity must be a number"
            });

        }

        const telemetryRecord = {
            shipment_id: shipmentId,
            temperature: parsedTemperature,
            humidity: parsedHumidity
        };

        if (indoorTemperature !== undefined) telemetryRecord.indoor_temperature = Number(indoorTemperature);
        if (outdoorTemperature !== undefined) telemetryRecord.outdoor_temperature = Number(outdoorTemperature);
        if (doorOpen !== undefined) telemetryRecord.door_open = Boolean(doorOpen);
        if (doorOpenSeconds !== undefined) telemetryRecord.door_open_seconds = Number(doorOpenSeconds);
        if (batteryLevel !== undefined) telemetryRecord.battery_level = Number(batteryLevel);

        const { data, error } =
            await supabase
                .from("telemetry")
                .insert([telemetryRecord])
                .select()
                .single();

        if (error) {

            console.error(
                "Telemetry database error:",
                error
            );

            return res.status(500).json({
                message: "Failed to save telemetry",
                error: error.message
            });

        }

        console.log(
            `📡 Telemetry received | ${shipmentId} | ${parsedTemperature}°C`
        );

        let processing = null;

        try {

            processing =
                await processTelemetry(
                    shipmentId
                );

        }

        catch (processingError) {

            console.error(
                "Telemetry processing error:",
                processingError.message
            );

            return res.status(201).json({

                message:
                    "Telemetry saved, but processing failed",

                telemetry: data,

                processing: null,

                processingError:
                    processingError.message

            });

        }

        return res.status(201).json({

            message:
                "Telemetry processed successfully",

            telemetry: data,

            processing

        });

    }

    catch (error) {

        console.error(
            "Telemetry route error:",
            error
        );

        return res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

});

module.exports = router;
