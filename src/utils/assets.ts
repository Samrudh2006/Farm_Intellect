export const getAssetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || "/";
  if (!path) return "";
  // If path is already a full URL or data URI, return as-is
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return base.endsWith("/") ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
};
