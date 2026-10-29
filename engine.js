/* Royal Ludo – game engine (port of LudoRulesEngine / LudoBoardLayout / LudoBotAI)
 * Token progress `p`:  -1 = in yard, 0..50 = on main track, 51..55 = home stretch, 56 = finished
 */
(function (root) {
  'use strict';

  const COLORS = [
    { id: 0, key: 'red',    en: 'Red',    bn: 'লাল',   offset: 0,  base: '#E63946', light: '#FF6B6B', dark: '#991B1B' },
    { id: 1, key: 'green',  en: 'Green',  bn: 'সবুজ',  offset: 13, base: '#10B981', light: '#34D399', dark: '#065F46' },
    { id: 2, key: 'yellow', en: 'Yellow', bn: 'হলুদ',  offset: 26, base: '#F59E0B', light: '#FBBF24', dark: '#B45309' },
    { id: 3, key: 'blue',   en: 'Blue',   bn: 'নীল',   offset: 39, base: '#3B82F6', light: '#60A5FA', dark: '#1D4ED8' }
  ];

  // [row, col] of the 52 main track cells
  const TRACK = [
    [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
    [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],
    [8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],
    [13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]
  ];
  const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
  const STAR_CELLS = [[6,1],[2,6],[1,8],[6,12],[8,13],[12,8],[13,6],[8,2]];

  const STRETCH = [
    [[7,1],[7,2],[7,3],[7,4],[7,5]],
    [[1,7],[2,7],[3,7],[4,7],[5,7]],
    [[7,13],[7,12],[7,11],[7,10],[7,9]],
    [[13,7],[12,7],[11,7],[10,7],[9,7]]
  ];
  const YARD = [
    [[1.5,1.5],[1.5,3.5],[3.5,1.5],[3.5,3.5]],
    [[1.5,10.5],[1.5,12.5],[3.5,10.5],[3.5,12.5]],
    [[10.5,10.5],[10.5,12.5],[12.5,10.5],[12.5,12.5]],
    [[10.5,1.5],[10.5,3.5],[12.5,1.5],[12.5,3.5]]
  ];
  const FINISH = [[7,6.4],[6.4,7],[7,7.6],[7.6,7]];

  const globalIdx = (color, p) => (COLORS[color].offset + p) % 52;

  function coordOf(color, tokenId, p) {
    if (p < 0) return YARD[color][tokenId];
    if (p <= 50) return TRACK[globalIdx(color, p)];
    if (p <= 55) return STRETCH[color][p - 51];
    return FINISH[color];
  }

  function findCaptured(color, gIdx, players) {
    if (SAFE.has(gIdx)) return [];
    const out = [];
    for (const pl of players) {
      if (pl.color === color) continue;
      for (const t of pl.tokens) {
        if (t.p >= 0 && t.p <= 50 && globalIdx(pl.color, t.p) === gIdx) out.push({ color: pl.color, id: t.id });
      }
    }
    return out;
  }

  // Returns a move or null if illegal.
  function getMove(player, token, dice, players) {
    const p = token.p;
    let to;
    if (p === -1) { if (dice !== 6) return null; to = 0; }
    else if (p === 56) return null;
    else { to = p + dice; if (to > 56) return null; }   // exact roll needed to finish
    const captured = to <= 50 ? findCaptured(player.color, globalIdx(player.color, to), players) : [];
    return { color: player.color, tokenId: token.id, from: p, to, captured, reachesHome: to === 56 };
  }

  function getValidMoves(player, dice, players) {
    return player.tokens.map(t => getMove(player, t, dice, players)).filter(Boolean);
  }

  function evaluate(move, players) {
    let s = 0;
    if (move.reachesHome) s += 1000;
    if (move.captured.length) s += 800 * move.captured.length;
    if (move.from === -1) s += 600;
    if (move.to >= 51 && move.to <= 55 && move.from >= 0 && move.from <= 50) s += 450;
    if (move.to >= 0 && move.to <= 50) {
      const g = globalIdx(move.color, move.to);
      if (SAFE.has(g)) s += 350;
      else {
        const threatened = players.some(o => o.color !== move.color && o.tokens.some(t => {
          if (t.p < 0 || t.p > 50) return false;
          const d = (g - globalIdx(o.color, t.p) + 52) % 52;
          return d >= 1 && d <= 6;
        }));
        if (threatened) s -= 200;
      }
      s += move.to * 6;
    }
    if (move.to >= 51 && move.to <= 55) s += (move.to - 51 + 1) * 30;
    return s;
  }

  function chooseBestMove(moves, players) {
    if (!moves.length) return null;
    if (moves.length === 1) return moves[0];
    let best = moves[0], hi = -Infinity;
    for (const m of moves) { const s = evaluate(m, players); if (s > hi) { hi = s; best = m; } }
    return best;
  }

  const api = { COLORS, TRACK, SAFE, STAR_CELLS, STRETCH, YARD, FINISH, globalIdx, coordOf, getMove, getValidMoves, chooseBestMove };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.LudoEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
