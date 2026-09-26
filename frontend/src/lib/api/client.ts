import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? '';
    const isAuthRequest = ['/auth/login', '/auth/refresh', '/auth/logout'].some(
      (endpoint) => requestUrl.includes(endpoint),
    );

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post<{ accessToken: string }>(
            '/api/auth/refresh',
            undefined,
            {
              withCredentials: true,
            },
          )
          .then(({ data }) => {
            setAccessToken(data.accessToken);

            return data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('clinic:auth-expired'));
      }

      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;