const crypto = require('crypto');
const { db, hashPass, verify, json, bearer } = require('./_lib');

const newPassword = () => crypto.randomBytes(6).toString('base64url'); // 8 characters, shown once

exports.handler = async (event) => {
  const me = verify(bearer(event), 'owner');
  if (!me) return json(401, { error: 'Owner login required' });
  try {
    if (event.httpMethod === 'GET') {
      const shops = await db('shops?select=id,name,market,hours,login_code,active,created_at&order=created_at.desc');
      return json(200, { shops });
    }
    const b = JSON.parse(event.body || '{}');
    if (event.httpMethod === 'POST') {
      if (!b.name || !b.login_code) return json(400, { error: 'Name and shop code are required' });
      const password = newPassword();
      const [shop] = await db('shops', {
        method: 'POST', prefer: 'return=representation',
        body: { name: b.name, market: b.market || null, hours: b.hours || null, login_code: b.login_code, pass_hash: hashPass(password) }
      });
      return json(201, { shop: { id: shop.id, name: shop.name, login_code: shop.login_code }, temporary_password: password });
    }
    if (event.httpMethod === 'PATCH') {
      if (b.action === 'active') {
        await db(`shops?id=eq.${encodeURIComponent(b.shop_id)}`, { method: 'PATCH', body: { active: !!b.active } });
        return json(200, { ok: true });
      }
      const password = newPassword();
      await db(`shops?id=eq.${encodeURIComponent(b.shop_id)}`, { method: 'PATCH', body: { pass_hash: hashPass(password) } });
      return json(200, { temporary_password: password });
    }
    return json(405, { error: 'Method not allowed' });
  } catch (e) {
    return json(500, { error: 'Server error' });
  }
};
