require("dotenv").config();

const express = require("express");
const cors = require("cors");
const telemetryRoutes = require("./routes/telemetryRoutes");
const supabase = require("./config/supabase");
const riskRoutes =
    require("./routes/riskRoutes");
const shipmentRoutes =
    require("./routes/shipmentRoutes");
const alertRoutes =
    require("./routes/alertRoutes");
const aiRoutes =
    require("./routes/aiRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "ColdSense.ai backend is running!"
    });
});

app.use("/api/telemetry", telemetryRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`ColdSense backend running on port ${PORT}`);
});
