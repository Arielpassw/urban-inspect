
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then(
        (m) => m.DashboardPage
      ),
  },
  {
    path: 'incidencias',
    loadComponent: () =>
      import('./pages/incidencias/incidencias.page').then(
        (m) => m.IncidenciasPage
      ),
  },
  {
    path: 'seguimiento',
    loadComponent: () =>
      import('./pages/seguimiento/seguimiento.page').then(
        (m) => m.SeguimientoPage
      ),
  },
  {
    path: 'incidencia-form',
    loadComponent: () =>
      import('./pages/incidencia-form/incidencia-form.page').then(
        (m) => m.IncidenciaFormPage
      ),
  },
  {
    path: 'incidencia-detalle/:id',
    loadComponent: () =>
      import('./pages/incidencia-detalle/incidencia-detalle.page').then(
        (m) => m.IncidenciaDetallePage
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
