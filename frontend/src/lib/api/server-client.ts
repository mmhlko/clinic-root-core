import "server-only";

import axios from "axios";
import { headers } from "next/headers";

const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

const serverApiClient = axios.create({
  baseURL: backendUrl,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

serverApiClient.interceptors.request.use(async (config) => {
  const requestHeaders = await headers();
  const clinicSlug = requestHeaders.get("x-clinic-slug");
  if (clinicSlug) {
    config.headers.set("X-Clinic-Slug", clinicSlug);
  }
  return config;
});

export default serverApiClient;
