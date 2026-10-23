const { db, hashPass, json } = require('./_lib');

// TEMPORARY one-time setup. Creates or resets the owner using the live site's own database connection.
// DELETE THIS FILE right after using it once.
exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  if (!q.u || !q.p || q.p.length < 8) return json(400, { error: 'Use ?u=ceo&p=yourpassword (8+ characters)' });
  try {
    await db('owners?on_conflict=username', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: { username: q.u, pass_hash: hashPass(q.p) }
    });
    return json(200, { ok: true, message: 'Owner saved. Now delete this file.' });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
