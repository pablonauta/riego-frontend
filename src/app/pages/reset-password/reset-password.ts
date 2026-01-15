import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent {

  form: FormGroup;

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  token = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(6)]]
    });

    const t = this.route.snapshot.queryParamMap.get('token');
    if (t) {
      this.token = t;
    } else {
      this.errorMessage.set('Token de recuperación inválido o ausente.');
    }
  }

  onSubmit(): void {
    if (!this.token) {
      this.errorMessage.set('No se encontró un token válido para restablecer la contraseña.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completá la contraseña correctamente.');
      this.successMessage.set(null);
      return;
    }

    const password = (this.form.get('password')?.value ?? '') as string;
    const password_confirmation = (this.form.get('password_confirmation')?.value ?? '') as string;

    if (password !== password_confirmation) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      this.successMessage.set(null);

      this.form.get('password')?.setErrors({ mismatch: true });
      this.form.get('password_confirmation')?.setErrors({ mismatch: true });
      this.form.get('password')?.markAsTouched();
      this.form.get('password_confirmation')?.markAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      token: this.token,
      password,
      password_confirmation
    };

    this.authService.resetPassword(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (resp) => {
          this.successMessage.set(
            resp?.message || 'Contraseña restablecida correctamente. Ahora podés iniciar sesión.'
          );
          this.form.reset();
          setTimeout(() => this.router.navigateByUrl('/login'), 2000);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'No se pudo restablecer la contraseña.');
        }
      });
  }
}
