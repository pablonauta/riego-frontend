import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {

  form: FormGroup;

  // Signals en lugar de propiedades normales
  cargando = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const email = this.form.value.email;

    this.authService.solicitarRecuperacion(email).subscribe({
      next: () => {
        this.cargando.set(false);
        this.successMessage.set(
          'Si el correo existe en el sistema, te enviamos un enlace para restablecer la contraseña.'
        );
      },
      error: () => {
        this.cargando.set(false);
        this.errorMessage.set(
          'Hubo un problema al solicitar la recuperación. Intentá más tarde.'
        );
      }
    });
  }
}
