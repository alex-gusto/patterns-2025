export function parseString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export function parseNumber(v: unknown) {
  if (typeof v === "number") return v;

  const _v = parseInt(parseString(v), 10);
  return Number.isFinite(_v) ? _v : 0;
}

export function toString(primitive: string | number | undefined) {
  if (typeof primitive === "string") return primitive;

  if (typeof primitive === "undefined") return "";

  if (Number.isFinite(primitive)) return primitive.toString();

  return "";
}
