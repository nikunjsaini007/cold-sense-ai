require("dotenv").config();

const supabase = require("./config/supabase");


const {
    startRealisticSimulator
} = require("./services/realisticTelemetrySimulator");


startRealisticSimulator();
