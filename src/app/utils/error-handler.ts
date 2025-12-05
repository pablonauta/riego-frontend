// src/app/utils/error-handler.ts

import { ApiError } from '../models/api-error.model';

export function interpretarError(err: any): string {
  const apiError = err.error as ApiError | undefined;

  // Error personalizado del backend con código
  if (apiError?.code) {
    return apiError.message || 'Ocurrió un error.';
  }

  // Error sin conexión
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  // Errores de auth
  if (err.status === 401) {
    return 'Credenciales inválidas.';
  }

  if (err.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  // Mensaje genérico
  return apiError?.message || 'Error inesperado.';
}
