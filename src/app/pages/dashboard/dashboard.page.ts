
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { IncidenciasService } from '../../services/incidencias.service';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    RouterModule,
  ],
})
export class DashboardPage implements OnInit {
  private incidenciasService = inject(IncidenciasService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  incidencias: Incidencia[] = [];
  cargando = false;
  error = '';

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  cargarIncidencias(): void {
    if (this.cargando) {
      return;
    }

    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    // Solicita los registros para calcular estadísticas globales.
    this.incidenciasService.obtenerIncidencias(1, 100).subscribe({
      next: (datos) => {
        console.log('Incidencias recibidas:', datos);

        // Ordenar de más reciente a más antigua.
        this.incidencias = [...datos].sort(
          (a, b) =>
            new Date(b.fecha).getTime() -
            new Date(a.fecha).getTime()
        );

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al consultar MockAPI:', err);

        this.error =
          'No se pudieron cargar las incidencias. Intenta nuevamente.';

        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  get totalIncidencias(): number {
    return this.incidencias.length;
  }

  get pendientes(): number {
    return this.incidencias.filter(
      (i) => i.estado?.toLowerCase() === 'pendiente'
    ).length;
  }

  get enProgreso(): number {
    return this.incidencias.filter(
      (i) => i.estado?.toLowerCase() === 'en progreso'
    ).length;
  }

  get resueltas(): number {
    return this.incidencias.filter(
      (i) => i.estado?.toLowerCase() === 'resuelta'
    ).length;
  }

  get incidenciasRecientes(): Incidencia[] {
    return this.incidencias.slice(0, 5);
  }

  abrirIncidencia(incidencia: Incidencia): void {
    if (!incidencia.id) {
      return;
    }

    this.router.navigate([
      '/incidencia-detalle',
      incidencia.id,
    ]);
  }
}
