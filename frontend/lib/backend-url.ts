/**
 * Returns the backend API base URL, ensuring HTTPS for non-localhost environments.
 * This prevents http→https redirects that cause Node.js fetch to strip auth headers.
 */
export function getBackendUrl(): string {
  let url = (process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:5000/api";
  if (url.startsWith('http://') && !url.includes('localhost')) {
    url = url.replace('http://', 'https://');
  }
  return url;
}
