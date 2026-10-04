const supabase = require("../config/supabase");

async function createAlert(shipmentId, risk) {

    if (risk.status === "NORMAL") {

        await resolveActiveAlerts(shipmentId);

        return null;
    }

    if (
        risk.status !== "WARNING" &&
        risk.status !== "CRITICAL" &&
        risk.status !== "EXCURSION"
    ) {

        return null;

    }

    const { data: existingAlert, error: existingError } =
        await supabase
            .from("alerts")
            .select("*")
            .eq("shipment_id", shipmentId)
            .eq("status", "active")
            .order("created_at", {
                ascending: false
            })
            .limit(1)
            .maybeSingle();

    if (existingError) {

        console.error(
            "Failed to check existing alert:",
            existingError
        );

        return null;

    }

    if (
        existingAlert &&
        existingAlert.risk_level === risk.status
    ) {

        return existingAlert;

    }

    if (existingAlert) {

        await supabase
            .from("alerts")
            .update({
                status: "resolved",
                resolved_at: new Date().toISOString()
            })
            .eq("id", existingAlert.id);

    }

    let message;

    if (risk.status === "EXCURSION") {

        message =
            `Temperature has exceeded the safe range. Current temperature: ${risk.currentTemperature}°C.`;

    }

    else if (risk.status === "CRITICAL") {

        message =
            `Temperature is rising rapidly. Upper limit may be crossed in approximately ${risk.predictedMinutes ?? "Not Resolved"} minutes.`;

    }

    else {

        message =
            `Temperature trend indicates increasing risk. Current temperature: ${risk.currentTemperature}°C.`;

    }

    const { data, error } =
        await supabase
            .from("alerts")
            .insert([
                {
                    shipment_id: shipmentId,
                    risk_level: risk.status,
                    message,
                    predicted_minutes:
                        risk.predictedMinutes,
                    status: "active"
                }
            ])
            .select()
            .single();

    if (error) {

        console.error(
            "Failed to create alert:",
            error
        );

        return null;

    }

    return data;

}

async function resolveActiveAlerts(shipmentId) {

    const { error } =
        await supabase
            .from("alerts")
            .update({
                status: "resolved",
                resolved_at: new Date().toISOString()
            })
            .eq("shipment_id", shipmentId)
            .eq("status", "active");

    if (error) {

        console.error(
            "Failed to resolve alerts:",
            error
        );

    }

}

module.exports = {
    createAlert,
    resolveActiveAlerts
};
