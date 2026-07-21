export function apiUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/$/, "");
  if (!base) return path;
  return `${base}${path}`;
}
