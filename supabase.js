const { createClient } = require("@supabase/supabase-js");
const config = require("./config.json").supabase;

const supabase = createClient(config.url, config.apiKey);

module.exports = supabase;