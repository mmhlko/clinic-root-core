import apiClient, { setAccessToken } from "@/lib/api/client";
import { RootApi } from "@/lib/api/root.api";
import type {
  LoginDto,
  AuthResponse,
} from '../types/auth.types';

class AuthApi extends RootApi {
  constructor() {
    super(apiClient);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const data = await this.requestPost<AuthResponse, LoginDto>('/auth/login', dto);

    setAccessToken(data.accessToken);

    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.requestPost('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  }

  async refresh(): Promise<AuthResponse> {
    const data = await this.requestPost<AuthResponse>('/auth/refresh');

    setAccessToken(data.accessToken);

    return data;
  }
}

export const authApi = new AuthApi();