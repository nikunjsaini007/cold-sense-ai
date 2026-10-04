const express = require("express");

const supabase = require("../config/supabase");

const router = express.Router();

router.get("/:shipmentId", async (req, res) => {

    try {

        const { shipmentId } = req.params;

        const { data, error } =
            await supabase
                .from("alerts")
                .select("*")
                .eq("shipment_id", shipmentId)
                .order("created_at", {
                    ascending: false
                });

        if (error) {

            return res.status(500).json({
                message: "Failed to fetch alerts",
                error: error.message
            });

        }

        res.json({

            shipmentId,

            count: data.length,

            alerts: data

        });

    }

    catch (error) {

        console.error("Alert fetch error:", error);

        res.status(500).json({

            message: "Failed to fetch alerts",

            error: error.message

        });

    }

});

module.exports = router;
