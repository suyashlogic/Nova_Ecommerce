// Specs arrive as a JSON string in multipart forms (e.g. '{"Battery":"30 hours"}')
// or as a real object in JSON requests. Returns a clean { name: "value" } object
// or throws an Error with a user-friendly message.
export default function parseSpecs(raw) {
  if (raw === undefined || raw === null || raw === '') return {};

  let value = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      throw new Error('Specifications must be valid JSON');
    }
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Specifications must be name/value pairs');
  }

  const entries = Object.entries(value);
  if (entries.length > 20) throw new Error('At most 20 specifications are allowed');

  const pairs = entries.map(([key, val]) => {
    if (typeof val === 'object' && val !== null) {
      throw new Error('Specification values must be text or numbers');
    }
    const name = key.trim();
    const text = String(val).trim();
    if (!name || name.length > 60 || !text || text.length > 200) {
      throw new Error('Specification names (max 60) and values (max 200) must not be empty');
    }
    return [name, text];
  });

  // fromEntries defines plain own properties, so a key like "__proto__" is harmless
  return Object.fromEntries(pairs);
}
