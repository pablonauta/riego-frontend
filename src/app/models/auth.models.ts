export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Respuesta del login.
 * Supongo que en el backend VAS a devolver (o ya devolvés): 
 * - token
 * - nombre
 * - email
 * - emailVerificado
 *
 * Si por ahora solo devuelve token, no pasa nada:
 * estas propiedades son opcionales (?)
 */
export interface AuthResponse {
  token: string;
  nombre?: string;
  email?: string;
  emailVerificado?: boolean;
}
