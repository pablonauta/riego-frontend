// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { AutorizacionPendiente } from './pages/autorizacion-pendiente/autorizacion-pendiente';
// Landing
import { LandingComponent } from './pages/landing/landing';

import { AdminUsuarios } from './pages/admin-usuarios/admin-usuarios';

// Login
import { LoginComponent } from './pages/login/login';

// Register
import { RegisterComponent } from './pages/register/register';

// Forgot Password
import { ForgotPassword } from './pages/forgot-password/forgot-password';

// Reset Password (el que acabamos de crear)
import { ResetPasswordComponent } from './pages/reset-password/reset-password';

// Dashboard
import { Dashboard } from './pages/dashboard/dashboard';

// Guard
import { AuthGuard } from './guards/auth-guard';

import { VerificacionPendienteComponent } from './pages/verificacion-pendiente/verificacion-pendiente';

import { BombasPage } from './pages/bombas/bombas';

import { DashboardHome } from './pages/dashboard-home';


export const routes: Routes = [

  {
    path: '',
    component: LandingComponent
  },

  {
    path: 'login',
    component: LoginComponent
    // si quisieras lazy:
    // loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: 'forgot-password',
    component: ForgotPassword
  },

  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },


  {
  path: 'verificacion-pendiente',
  component: VerificacionPendienteComponent
  },

  {
  path: 'autorizacion-pendiente',
  component: AutorizacionPendiente,
  canActivate: [AuthGuard]
},

  {
  path: 'dashboard',
  component: Dashboard,
  canActivate: [AuthGuard],
  children: [
    { path: '', component: DashboardHome },   // ✅ home del dashboard
    { path: 'bombas', component: BombasPage },// ✅ bombas
    {
  path: 'usuarios',
  component: AdminUsuarios,
  canActivate: [AuthGuard],
  data: { roles: ['ROLE_ADMIN'] }
}
  ]
},

  {
    path: '**',
    redirectTo: ''
  }

];
