export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: string;
  entityId: number;
}

export interface UserInfo {
  username: string;
  role: string;
}