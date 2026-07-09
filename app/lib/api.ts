export function getServerApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "")
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`
    : "http://localhost:3000";

  return new URL(path, `${baseUrl}/`).toString();
}
