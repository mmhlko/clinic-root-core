import "server-only";

import axios from "axios";

const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3001";

const serverApiClient = axios.create({
  baseURL: backendUrl,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default serverApiClient;
