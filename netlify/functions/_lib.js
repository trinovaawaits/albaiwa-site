const crypto = require('crypto');

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
const SECRET = process.env.SESSION_SECRET;

// Thin REST client for Supabase (server-side only, service key never reaches the browser)
async function db(path, { method = 'GET', body, prefer } = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`DB ${r.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

function hashPass(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function checkPass(password, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, 'hex'));
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 12 * 3600e3 })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token, role) {
  if (!token || !SECRET) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const p = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (p.exp < Date.now()) return null;
  if (role && p.role !== role) return null;
  return p;
}

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(obj)
});

const bearer = (event) => ((event.headers.authorization || '').replace('Bearer ', ''));

module.exports = { db, hashPass, checkPass, sign, verify, json, bearer };
