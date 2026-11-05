
import { Routes } from '@angular/router';

export const routes: Routes = [

  // Inicio de sesión
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },

  // Registro de usuarios
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },

  // Incidencias
  {
    path: 'incidencias',
    loadComponent: () =>
      import('./pages/incidencias/incidencias.page').then(
        (m) => m.IncidenciasPage
      ),
  },

  // Seguimiento
  {
    path: 'seguimiento',
    loadComponent: () =>
      import('./pages/seguimiento/seguimiento.page').then(
        (m) => m.SeguimientoPage
      ),
  },

  // Formulario de incidencias
  {
    path: 'incidencia-form',
    loadComponent: () =>
      import('./pages/incidencia-form/incidencia-form.page').then(
        (m) => m.IncidenciaFormPage
      ),
  },

  // Detalle de incidencia
  {
    path: 'incidencia-detalle/:id',
    loadComponent: () =>
      import('./pages/incidencia-detalle/incidencia-detalle.page').then(
        (m) => m.IncidenciaDetallePage
      ),
  },

  // Ruta inicial: mostrar login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Rutas inexistentes
  {
    path: '**',
    redirectTo: 'login',
  },

];
