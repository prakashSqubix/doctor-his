const CryptoJS = require('crypto-js');

const method = 'POST';
const path = '/users/login-user';
const timestamp = '1774852908895';
const bodyObj = {
  "email": "deepak.senapati@squbix.com",
  "password": "99999999"
};
const body = JSON.stringify(bodyObj);
const secret = 'squmed_sign';
const expectedInRequest = 'fc9a3c1aaf01b35c58133598fa197694f3365560408a3278bbea5097973cc2f7';

const variations = [
  { name: 'M+P+T+B', val: `${method}${path}${timestamp}${body}` },
  { name: 'M+P+T+B (no slash)', val: `${method}${path.substring(1)}${timestamp}${body}` },
  { name: 'M+P+T+B (trailing slash)', val: `${method}${path}/${timestamp}${body}` },
  { name: 'M+P+T+B (space)', val: `${method} ${path} ${timestamp} ${body}` },
];

console.log('--- Testing with squmed_sign ---');
variations.forEach(v => {
  const sig = CryptoJS.HmacSHA256(v.val, secret).toString(CryptoJS.enc.Hex);
  console.log(`${v.name}: ${sig}`);
});

console.log('\n--- Verify fc9a3... again with HEX secret ---');
const hexSecret = 'e20f02b5a232fe0de80b4ecca7e71dcd8bca920bbc34daef21f0a456087c6398';
variations.forEach(v => {
  const sig = CryptoJS.HmacSHA256(v.val, hexSecret).toString(CryptoJS.enc.Hex);
  if (sig === expectedInRequest) {
    console.log(`MATCH! ${v.name} uses ${hexSecret}`);
  }
});
