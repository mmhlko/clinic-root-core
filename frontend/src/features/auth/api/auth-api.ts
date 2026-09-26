import apiClient, { setAccessToken } from "@/lib/api/client";
import type {
  LoginDto,
  AuthResponse,
} from '../types/auth.types';

class AuthApi {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/login',
      dto,
    );

    setAccessToken(data.accessToken);

    return data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  }

  async refresh(): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/refresh',
    );

    setAccessToken(data.accessToken);

    return data;
  }
}

export const authApi = new AuthApi();