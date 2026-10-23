const { db, checkPass, sign, json } = require('./_lib');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const { role, username, code, password } = JSON.parse(event.body || '{}');
    if (typeof password !== 'string' || password.length > 200) return json(400, { error: 'Invalid request' });

    if (role === 'owner') {
      const [o] = await db(`owners?username=eq.${encodeURIComponent(String(username || ''))}&select=id,pass_hash`);
      if (!o || !checkPass(password, o.pass_hash)) return json(401, { error: 'Wrong details' });
      return json(200, { token: sign({ role: 'owner', id: o.id }) });
    }

    if (role === 'shop') {
      const [s] = await db(`shops?login_code=eq.${encodeURIComponent(String(code || ''))}&active=eq.true&select=id,pass_hash`);
      if (!s || !checkPass(password, s.pass_hash)) return json(401, { error: 'Wrong details' });
      return json(200, { token: sign({ role: 'shop', id: s.id }) });
    }

    return json(400, { error: 'Unknown role' });
  } catch (e) {
    return json(500, { error: 'Server error' });
  }
};
