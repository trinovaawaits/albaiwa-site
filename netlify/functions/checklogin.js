const { db, checkPass, json } = require('./_lib');

// TEMPORARY test. Reports only whether the password matches. Delete after testing.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'POST only' });
  const { username, password } = JSON.parse(event.body || '{}');
  try {
    const rows = await db(`owners?username=eq.${encodeURIComponent(String(username || ''))}&select=pass_hash`);
    if (!rows.length) return json(200, { user_found: false });
    const stored = rows[0].pass_hash;
    return json(200, {
      user_found: true,
      hash_length: stored.length,
      has_colon: stored.includes(':'),
      password_matches: checkPass(String(password || ''), stored)
    });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
