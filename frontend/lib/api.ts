export function apiUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4100").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
