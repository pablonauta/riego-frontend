export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  code?: string | null;
  validationErrors?: {
    [campo: string]: string[];
  } | null;
}