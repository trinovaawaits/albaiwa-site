const { db, verify, json, bearer } = require('./_lib');

const UUID = /^[0-9a-f-]{36}$/i;

exports.handler = async (event) => {
  try {
    const q = event.queryStringParameters || {};
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const threadId = body.thread_id || q.thread_id;
    const token = body.token || q.token; // customer's private order link
    if (!UUID.test(threadId || '')) return json(400, { error: 'Bad thread' });

    const [thread] = await db(`threads?id=eq.${threadId}&select=id,order_id`);
    if (!thread) return json(404, { error: 'Not found' });
    const [order] = await db(`orders?id=eq.${thread.order_id}&select=id,shop_id,access_token`);

    const shop = verify(bearer(event), 'shop');
    const isCustomer = token && token === order.access_token;
    const isShop = shop && shop.id === order.shop_id;
    if (!isCustomer && !isShop) return json(403, { error: 'Not allowed' });

    if (event.httpMethod === 'GET') {
      const messages = await db(`messages?thread_id=eq.${threadId}&select=sender_type,body,kind,created_at&order=created_at.asc`);
      return json(200, { messages });
    }

    if (event.httpMethod === 'POST') {
      const text = String(body.body || '').trim().slice(0, 1000);
      if (!text) return json(400, { error: 'Empty message' });
      await db('messages', { method: 'POST', body: { thread_id: threadId, sender_type: isShop ? 'shop' : 'customer', body: text } });
      return json(201, { ok: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (e) {
    return json(500, { error: 'Server error' });
  }
};
