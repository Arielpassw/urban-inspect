
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
  ],
})
export class DashboardPage implements OnInit {
  private incidenciasService = inject(IncidenciasService);
  private cdr = inject(ChangeDetectorRef);

  incidencias: Incidencia[] = [];
  cargando = false;
  error = '';

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  cargarIncidencias(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.incidenciasService.obtenerIncidencias(1, 5).subscribe({
      next: (datos) => {
        console.log('Incidencias recibidas:', datos);

        this.incidencias = datos;
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
      (i) => i.estado === 'pendiente'
    ).length;
  }

  get enProgreso(): number {
    return this.incidencias.filter(
      (i) => i.estado === 'en progreso'
    ).length;
  }

  get resueltas(): number {
    return this.incidencias.filter(
      (i) => i.estado === 'resuelta'
    ).length;
  }
}
