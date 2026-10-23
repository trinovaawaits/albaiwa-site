const { db, json } = require('./_lib');

// Public: anyone can browse active shops and products. Login codes and password hashes are never returned.
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const shops = await db('shops?active=eq.true&select=id,name,market,hours,logo_url');
    const products = await db('products?select=id,shop_id,name,category,price,stock,colors,sizes,image_url&order=created_at.desc');
    return json(200, { shops, products });
  } catch (e) {
    return json(500, { error: 'Server error' });
  }
};
