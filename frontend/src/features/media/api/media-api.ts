import "client-only";

import { RootApi } from "@/lib/api/root.api";
import apiClient from "@/lib/api/client";
import { MediaUploadResponse } from "../types/media.types";

class MediaClientApi extends RootApi {
  constructor() {
    super(apiClient);
  }

  private getFilenameFromUrl(url: string): string {
    const clean = url.split(/[?#]/)[0].replace(/\/+$/, "");
    const raw = clean.split("/").pop() ?? "";

    try {
      return encodeURIComponent(decodeURIComponent(raw));
    } catch {
      return encodeURIComponent(raw);
    }
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return this.requestPost<MediaUploadResponse, FormData>(
      "/media/images",
      formData,
      { contentType: "multipart/form-data" },
    );
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return this.requestPost<MediaUploadResponse, FormData>(
      "/media/files",
      formData,
      { contentType: "multipart/form-data" },
    );
  }

  deleteImage(filename: string) {
    return this.requestDelete(
      `/media/images/${this.getFilenameFromUrl(filename)}`,
    );
  }

  deleteFile(filename: string) {
    return this.requestDelete(
      `/media/files/${this.getFilenameFromUrl(filename)}`,
    );
  }

  deleteMedia(id: string) {
    return this.requestDelete(
      `/media/${id}`,
    );
  }
}

export const mediaClientApi = new MediaClientApi();