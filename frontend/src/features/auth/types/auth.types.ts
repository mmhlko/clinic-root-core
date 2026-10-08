import { MediaDbData } from "@/features/doctors/types/doctors.types";

export type UserRole = 'root' | 'admin' | 'manager';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  photoMedia?: MediaDbData;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}