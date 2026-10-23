const { db, json } = require('./_lib');

// TEMPORARY diagnostic. Shows which settings exist (never their values) and the exact database response.
exports.handler = async () => {
  const env = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    SESSION_SECRET: !!process.env.SESSION_SECRET,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY
  };
  try {
    const shops = await db('shops?select=id&limit=1');
    const owners = await db('owners?select=username');
    return json(200, { env, shops_found: shops.length, owners: owners.map((o) => o.username) });
  } catch (e) {
    return json(500, { env, error: e.message });
  }
};
