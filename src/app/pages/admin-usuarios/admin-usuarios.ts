
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  emailVerificado: boolean;
  estadoAutorizacion: string;
  roles: string[];
  createdAt: string;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.css']
})
export class AdminUsuarios implements OnInit {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  usuarios = signal<UsuarioAdmin[]>([]);
  cargando = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set('');

    this.http.get<UsuarioAdmin[]>(
      `${this.apiUrl}/admin/usuarios`
    ).subscribe({
      next: usuarios => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de usuarios.');
        this.cargando.set(false);
      }


    });


  }


aprobarUsuario(usuario: UsuarioAdmin): void {

  if (!usuario.emailVerificado) {
    this.error.set('Primero debés verificar el correo del usuario.');
    return;
  }

  const confirmar = window.confirm(
    `¿Querés aprobar la cuenta de ${usuario.nombre}?`
  );

  if (!confirmar) {
    return;
  }

  this.error.set('');

  this.http.put(
    `${this.apiUrl}/admin/usuarios/${usuario.id}/aprobar`,
    {}
  ).subscribe({
    next: () => {
      this.cargarUsuarios();
    },
    error: () => {
      this.error.set('No se pudo aprobar al usuario.');
    }
  });
}


suspenderUsuario(usuario: UsuarioAdmin): void {

  const confirmar = window.confirm(
    `¿Querés suspender la cuenta de ${usuario.nombre} (${usuario.email})?`
  );

  if (!confirmar) {
    return;
  }

  this.error.set('');

  this.http.put(
    `${this.apiUrl}/admin/usuarios/${usuario.id}/suspender`,
    {}
  ).subscribe({
    next: () => {
      this.cargarUsuarios();
    },
    error: err => {
      this.error.set(
        err.error?.message || 'No se pudo suspender al usuario.'
      );
    }
  });
}


}
