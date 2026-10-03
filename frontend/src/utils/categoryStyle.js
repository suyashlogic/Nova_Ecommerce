// Each category gets its own tint (a hue 0-360). Cards use it via a CSS variable.
const HUES = { technology: 215, audio: 265, gaming: 150, workspace: 28, lifestyle: 340, home: 175 };

export function categoryHue(slug) {
  if (HUES[slug] !== undefined) return HUES[slug];
  // Unknown (admin-created) category: derive a stable hue from its name
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}
