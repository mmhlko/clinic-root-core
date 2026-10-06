export const getImageUrl = (path?: string | null) => {
  if (!path) return undefined;

  if (path.startsWith("http")) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
};