require("dotenv").config();

const supabase = require("./config/supabase");

const {
    analyzeSensors
} = require("./services/sensorEngine");


const result =
    analyzeSensors({

        indoorTemperature: 7.4,

        outdoorTemperature: 32.5,

        humidity: 74,

        doorOpen: true,

        doorOpenSeconds: 45,

        batteryLevel: 22

    });


console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);