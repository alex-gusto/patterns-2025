export function parseString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export function parseNumber(v: unknown) {
  if (typeof v === "number") return v;

  const _v = parseInt(parseString(v), 10);
  return Number.isFinite(_v) ? _v : 0;
}

export function toString(v: string | number | undefined) {
  if (typeof v === "string") return v;

  if (typeof v === "undefined") return "";

  if (Number.isFinite(v)) return v.toString();

  return "";
}
