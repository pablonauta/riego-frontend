import { Routes } from '@angular/router';

// Login
import { LoginComponent } from './login/login';

// Dashboard
import { Dashboard } from './pages/dashboard/dashboard';

// Guard (clase)
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [AuthGuard]
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
