/** Convert snake_case keys to camelCase for API responses */
export const toCamel = (str) =>
  str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const toSnake = (str) =>
  str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

export const mapRowToCamel = (row) => {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[toCamel(k)] = v;
  }
  return out;
};

export const mapRowsToCamel = (rows) =>
  Array.isArray(rows) ? rows.map(mapRowToCamel) : [];

export const mapRowToSnake = (row) => {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (v !== undefined) out[toSnake(k)] = v;
  }
  return out;
};
