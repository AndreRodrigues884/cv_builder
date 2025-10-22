import { Billing, Profile, User } from "./userInterface";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  billing: Billing | null;
  accessToken: string | null;
  refreshToken: string | null;
}