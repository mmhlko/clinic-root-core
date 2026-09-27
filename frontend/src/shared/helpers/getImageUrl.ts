export const getImageUrl = (path?: string | null) => {
  if (!path) return undefined;

  if (path.startsWith("http")) {
    return path;
  }

  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};