export const UNITS = ['', 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'pinch'];
const FR = [[0, ''], [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [1 / 2, '½'], [2 / 3, '⅔'], [3 / 4, '¾'], [1, '']];

// "1/2", "1 1/2", "2.5" -> number (NaN if invalid)
export function parseQty(s) {
  const t = String(s).trim();
  const m = t.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  if (m) return Number(m[1] || 0) + Number(m[2]) / Number(m[3]);
  return t === '' ? NaN : Number(t);
}

// 1.5 -> "1½", 0.333 -> "⅓", 12.34 -> "12.3"
export function fmtQty(n) {
  if (n >= 10) return String(Math.round(n * 10) / 10);
  let w = Math.floor(n); const f = n - w;
  const [v, sym] = FR.reduce((a, b) => (Math.abs(b[0] - f) < Math.abs(a[0] - f) ? b : a));
  if (Math.abs(v - f) > 0.04) return String(Math.round(n * 100) / 100);
  if (v === 1) w += 1;
  return (w || sym ? `${w || ''}${sym}` : '0');
}

// Scale one ingredient and pick the friendliest unit (3 tsp -> 1 tbsp, 1200 g -> 1.2 kg)
export function scaleIngredient(ing, factor) {
  let q = ing.quantity * factor, u = ing.unit;
  if (u === 'g' && q >= 1000) { q /= 1000; u = 'kg'; }
  else if (u === 'kg' && q < 1) { q *= 1000; u = 'g'; }
  else if (u === 'ml' && q >= 1000) { q /= 1000; u = 'l'; }
  else if (u === 'l' && q < 1) { q *= 1000; u = 'ml'; }
  if (u === 'tsp' && q >= 3) { q /= 3; u = 'tbsp'; }
  if (u === 'tbsp' && q >= 4) { q /= 16; u = 'cup'; }
  if (u === 'cup' && q < 0.25) { q *= 16; u = 'tbsp'; }
  if (u === 'tbsp' && q < 1) { q *= 3; u = 'tsp'; }
  return { qty: fmtQty(q), unit: u };
}
