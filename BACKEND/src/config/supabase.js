const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testRole() {
    const { data, error } = await supabase.rpc("get_my_role");

    console.log("ROLE TEST:", { data, error });
}

testRole();

module.exports = supabase;
