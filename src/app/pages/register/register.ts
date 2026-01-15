// src/app/pages/register/register.ts

import { Component, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  form: FormGroup;

  // 👉 Signals para estado de UI
  loading = signal(false);
  messageSuccess = signal<string | null>(null);
  messageError = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    // Si el formulario es inválido, marcamos todo y salimos
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageError.set('Completá todos los campos correctamente.');
      this.messageSuccess.set(null);
      return;
    }

    // Verificamos que las contraseñas coincidan
    const { password, password_confirmation } = this.form.value;

    if (password !== password_confirmation) {
      this.messageError.set('Las contraseñas no coinciden.');
      this.messageSuccess.set(null);

      const passCtrl = this.form.get('password');
      const passConfCtrl = this.form.get('password_confirmation');

      passCtrl?.setErrors({ mismatch: true });
      passConfCtrl?.setErrors({ mismatch: true });

      passCtrl?.markAsTouched();
      passConfCtrl?.markAsTouched();

      return;
    }

    this.loading.set(true);
    this.messageError.set(null);
    this.messageSuccess.set(null);

    const payload = this.form.value;

    this.authService.register(payload)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          console.log('Finalize, loading =', this.loading());
        })
      )
      .subscribe({
        next: (resp) => {
                 console.log('Registro OK:', resp);

                // agarrar el email ANTES de resetear
                const email = (this.form.get('email')?.value || '').trim();

                // guardarlo para la pantalla de verificación
                localStorage.setItem('pendingVerificationEmail', email);

                // opcional: limpiar el form
                this.form.reset();

  // navegar a tu pantalla existente
  this.router.navigateByUrl('/verificacion-pendiente');
        },
        error: (err) => {
          console.error('Error en registro:', err);

          const emailCtrl = this.form.get('email');

          if (err?.error?.code === 'EMAIL_ALREADY_REGISTERED') {
            this.messageError.set(
              'Este correo ya está registrado. Probá con otro o iniciá sesión.'
            );

            if (emailCtrl) {
              const prevErrors = emailCtrl.errors || {};
              emailCtrl.setErrors({ ...prevErrors, emailTaken: true });
              emailCtrl.markAsTouched();
            }

          } else {
            this.messageError.set(
              err?.error?.message ||
              'Ocurrió un error al registrar. Probá de nuevo.'
            );
          }
        }
      });
  }
}
