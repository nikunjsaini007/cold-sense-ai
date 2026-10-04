const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();



router.post("/", async (req, res) => {

    try {

        const {
            shipmentId,
            productName,
            productType,
            origin,
            destination,
            minTemperature,
            maxTemperature
        } = req.body;


        if (
            !shipmentId ||
            !productName ||
            minTemperature === undefined ||
            maxTemperature === undefined
        ) {

            return res.status(400).json({
                message: "Missing required shipment information"
            });

        }


        const { data, error } = await supabase
            .from("shipments")
            .insert([
                {
                    shipment_id: shipmentId,
                    product_name: productName,
                    product_type: productType || "OTHER",
                    origin,
                    destination,
                    min_temperature: minTemperature,
                    max_temperature: maxTemperature
                }
            ])
            .select();


        if (error) {

            return res.status(500).json({
                message: "Failed to create shipment",
                error: error.message
            });

        }


        res.status(201).json({
            message: "Shipment created successfully",
            data
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});


router.get("/", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("shipments")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {

            return res.status(500).json({
                message: "Failed to fetch shipments",
                error: error.message
            });

        }


        res.json({
            count: data.length,
            shipments: data
        });

    }

    catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});


router.get("/:shipmentId/location", async (req, res) => {
    try {
        const { shipmentId } = req.params;
        const { data, error } = await supabase
            .from("telemetry")
            .select("latitude, longitude, recorded_at")
            .eq("shipment_id", shipmentId)
            .not("latitude", "is", null)
            .not("longitude", "is", null)
            .order("recorded_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error || !data) {
            return res.status(404).json({ message: "Location unavailable", shipmentId });
        }

        return res.json({
            shipmentId,
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            updatedAt: data.recorded_at
        });
    } catch (error) {
        return res.status(404).json({ message: "Location unavailable", shipmentId: req.params.shipmentId });
    }
});

router.get("/:shipmentId", async (req, res) => {

    try {

        const { shipmentId } = req.params;


        const { data, error } = await supabase
            .from("shipments")
            .select("*")
            .eq("shipment_id", shipmentId)
            .single();


        if (error) {

            return res.status(404).json({
                message: "Shipment not found",
                error: error.message
            });

        }


        res.json({
            shipment: data
        });

    }

    catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});

module.exports = router;
