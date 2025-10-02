export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  isActive: boolean;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    department?: string;
    avatar?: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}