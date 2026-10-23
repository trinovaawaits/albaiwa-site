const { db, verify, json, bearer } = require('./_lib');

// Shop dashboard API. Every request is limited to the shop in its own signed token.
exports.handler = async (event) => {
  const me = verify(bearer(event), 'shop');
  if (!me) return json(401, { error: 'Shop login required' });
  try {
    if (event.httpMethod === 'GET') {
      const products = await db(`products?shop_id=eq.${me.id}&select=id,name,category,price,stock,colors,sizes&order=created_at.desc`);
      const orders = await db(
        `orders?shop_id=eq.${me.id}&select=id,order_no,total,payment_method,payment_status,status,created_at,customer:customers(name,phone,address),threads(id)&order=created_at.desc&limit=100`
      );
      return json(200, { products, orders });
    }

    const b = JSON.parse(event.body || '{}');
    const num = (v, max) => Math.max(0, Math.min(max, Number(v) || 0));

    if (event.httpMethod === 'POST') {
      if (!b.name || b.price === undefined) return json(400, { error: 'Name and price are required' });
      const list = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 30);
      await db('products', {
        method: 'POST',
        body: {
          shop_id: me.id, name: String(b.name).slice(0, 120), category: String(b.category || '').slice(0, 60) || null,
          price: num(b.price, 10000000), stock: Math.floor(num(b.stock, 1000000)), colors: list(b.colors), sizes: list(b.sizes)
        }
      });
      return json(201, { ok: true });
    }

    if (event.httpMethod === 'PATCH') {
      const patch = {};
      if (b.price !== undefined) patch.price = num(b.price, 10000000);
      if (b.stock !== undefined) patch.stock = Math.floor(num(b.stock, 1000000));
      await db(`products?id=eq.${encodeURIComponent(b.product_id)}&shop_id=eq.${me.id}`, { method: 'PATCH', body: patch });
      return json(200, { ok: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (e) {
    return json(500, { error: 'Server error' });
  }
};
