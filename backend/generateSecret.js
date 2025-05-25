const crypto = require('crypto');

// Generate a random 64-byte secret and convert it to a hexadecimal string
const secret = crypto.randomBytes(64).toString('hex');

// Log the secret to the console
console.log(secret);
