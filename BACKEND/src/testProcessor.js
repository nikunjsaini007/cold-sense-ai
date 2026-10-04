require("dotenv").config();

const supabase = require("./config/supabase");

const {
    processTelemetry
} = require("./services/telemetryProcessor");


async function test() {

    try {

        const result =
            await processTelemetry(
                "SHP001"
            );


        console.log(
            "\n========== RESULT ==========\n"
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );

    }

    catch (error) {

        console.error(
            error
        );

    }

}


test();