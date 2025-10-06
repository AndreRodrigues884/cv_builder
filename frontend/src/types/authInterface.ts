export interface User {
  id: string
  name: string
  email: string
  // adiciona outros campos do usuário conforme necessário
}

export interface Credentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}