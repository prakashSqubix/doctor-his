import CryptoJS from 'crypto-js';
import Config from 'react-native-config';

/**
 * Generates an HMAC SHA256 signature for API requests.
 * 
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - API endpoint path
 * @param {string} timestamp - Current timestamp in milliseconds
 * @param {string} body - JSON stringified request body
 * @returns {string} - Computed HMAC signature
 */
export const generateHMAC = (method, path, timestamp, body = '') => {
  const secret =  'squmed_sign';
  const data = `${method}${path}${timestamp}${body}`;
  const signature = CryptoJS.HmacSHA256(data, secret).toString(CryptoJS.enc.Hex);
  return signature;
};
