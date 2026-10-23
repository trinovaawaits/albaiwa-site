// Usage: node scripts/make-hash.js "your-password"
// Prints a salted hash to store in the owners or shops table. Never store plain passwords.
const { hashPass } = require('../netlify/functions/_lib');
if (!process.argv[2]) { console.error('Give a password'); process.exit(1); }
console.log(hashPass(process.argv[2]));
