import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { LoginRequest, AuthResponse } from '../models/auth.models';
import { ApiError } from '../models/api-error.model';
import { interpretarError } from '../utils/error-handler';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  form: FormGroup;
  cargando = false;
  errorMessage = '';
  emailNoVerificado = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.errorMessage = '';
    this.emailNoVerificado = false;

    const data: LoginRequest = this.form.value;

    this.authService.login(data).subscribe({
      next: (resp: AuthResponse) => {
        this.cargando = false;
        console.log('LOGIN OK', resp);

        // Si el backend maneja email no verificado con ERROR (EMAIL_NOT_VERIFIED),
        // esto capaz ni se usa, pero queda pronto para el futuro.
        const user = this.authService.getUsuarioActual();
        const emailVerificado =
          user?.emailVerificado ??
          resp.emailVerificado ??
          true; // por defecto true para no trabar si no viene

        if (!emailVerificado) {
          this.router.navigate(['/verificacion-pendiente']);
          return;
        }

        // Usuario con email verificado → al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        console.log('LOGIN ERROR', err);

        const apiError = err.error as ApiError | undefined;

        // Email no verificado (manejado como error desde el backend)
        if (apiError?.code === 'EMAIL_NOT_VERIFIED') {
          this.emailNoVerificado = true;
          this.errorMessage =
            apiError.message || 'Debes verificar tu email antes de iniciar sesión.';
          return;
        }

        // Credenciales inválidas
        if (apiError?.code === 'INVALID_CREDENTIALS') {
          this.errorMessage = apiError.message || 'Credenciales inválidas.';
          return;
        }

        // Otros errores
        this.errorMessage = interpretarError(err);
      }
    });
  }
}
