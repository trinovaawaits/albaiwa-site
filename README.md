# Al-Bai' Wa Al-Shiraa — site

## Setup (about 15 minutes)
1. **Supabase:** create a project, open SQL Editor, run `supabase/schema.sql`.
2. **Owner account:** run `node scripts/make-hash.js "your-owner-password"`, then in SQL:
   `insert into owners (username, pass_hash) values ('ceo', 'PASTE_HASH');`
3. **Netlify:** Site settings → Environment variables:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (service_role key), `SESSION_SECRET` (long random string), `GEMINI_API_KEY`
   - Never paste these into chat or commit them to GitHub. If a key was ever shared in chat, rotate it.
4. **GitHub:** push this folder, then Netlify → Add new site → Import from Git.

## How it works
- **Public site** (`/`): anyone can browse shops, search products, place a COD order and chat with the shop. Customers need no account.
- **Owner panel** (`/owner.html`): tap the Trinova logo in the footer 3 times, enter the owner username and password. Create shops, activate or deactivate memberships, reset shop passwords.
- **Shop dashboard** (`/shop.html`): tap a shop's logo on its page 3 times, enter the shop code and password. Manage products, stock and prices, see orders, reply in order chats.

## Not built yet
Rider offers and group chats, COD proof photo, online payment gateway, automatic WhatsApp messages, fingerprint/face login, stock reduction at checkout.
