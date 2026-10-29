/* Optional settings for online play.
 * By default Royal Ludo uses the free public PeerJS cloud server + Google STUN, which needs no setup.
 * If some friends can't connect (strict mobile networks), add a TURN server here:
 *   window.LUDO_CONFIG = { ice: [ { urls: 'stun:stun.l.google.com:19302' },
 *                                 { urls: 'turn:YOUR_TURN_HOST:3478', username: 'USER', credential: 'PASS' } ] };
 * To use your own PeerJS server:  window.LUDO_CONFIG = { peer: { host: 'your.host', port: 443, path: '/', secure: true } };
 */
window.LUDO_CONFIG = {};
