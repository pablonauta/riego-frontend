import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  form: FormGroup;

  // ESTADO MODERNO CON SIGNALS
  errorMessage = signal<string | null>(null);

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

  onSubmit(): void {
    console.log('SUBMIT LOGIN (RIEGO + SIGNALS)');
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completá email y contraseña');
      return;
    }

    const payload = this.form.value;

    this.authService.login(payload).subscribe({
      next: (resp) => {
        console.log('LOGIN OK', resp);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log('ENTRÉ AL ERROR DEL LOGIN (RIEGO)', err);

        // ✅ MENSAJE FIJO CON SIGNAL
        this.errorMessage.set('Usuario o contraseña incorrectos');
      }
    });
  }
}
