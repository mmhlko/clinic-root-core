export type MediaStatus = "temporary" | "attached";

export interface MediaUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  fileType: string;
  url: string;
  status: MediaStatus;
}