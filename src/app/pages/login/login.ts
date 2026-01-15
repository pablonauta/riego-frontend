import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
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

  ngOnInit(): void {
  // si no hay token, que se vea el login normal
  if (!this.authService.estaAutenticado()) return;

  // hay token: lo validamos consultando al backend
  this.authService.me().subscribe({
    next: (me) => {
      console.log('Sesion valida:', me);

      // opcional: guardar usuario (lo mejor)
      localStorage.setItem('usuario', JSON.stringify(me));

      this.router.navigate(['/dashboard'], { replaceUrl: true });
    },
    error: (err) => {
      console.warn('Token invalido o vencido, limpiando sesion', err);

      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      // y nos quedamos en login
    }
  });
}


  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completá email y contraseña');
      return;
    }

    const payload = {
  email: (this.form.value.email ?? '').trim(),
  password: this.form.value.password ?? ''
};

    this.authService.login(payload).subscribe({
  next: (resp) => {
    console.log('LOGIN OK', resp);

    this.authService.guardarSesion(resp.token, null);

    this.router.navigate(['/dashboard'], { replaceUrl: true });
  },
  error: (err) => {

    if (err.status === 403 && err?.error?.code === 'EMAIL_NOT_VERIFIED') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      localStorage.setItem('email-pendiente', payload.email);

      this.router.navigate(['/verificacion-pendiente'], { replaceUrl: true });
      return;
    }

    // (opcional, pero recomendable)
    if (err.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }

    this.errorMessage.set(
      err?.error?.message ?? 'Usuario o contraseña incorrectos'
    );
  }
});

  }
}
