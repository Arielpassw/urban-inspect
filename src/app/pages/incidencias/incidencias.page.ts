
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSearchbar,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonText,
  IonBadge,
  IonList,
  IonLabel,
} from '@ionic/angular';

import { RouterModule } from '@angular/router';

import { IncidenciasService } from '../../services/incidencias.service';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.page.html',
  styleUrls: ['./incidencias.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSearchbar,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonText,
  IonBadge,
  IonList,
  IonLabel,
  RouterModule,
  ],
})
export class IncidenciasPage implements OnInit {
  private incidenciasService = inject(IncidenciasService);
  private cdr = inject(ChangeDetectorRef);

  incidencias: Incidencia[] = [];
  cargando = false;
  error = '';

  paginaActual = 1;
  readonly registrosPorPagina = 5;
  hayPaginaSiguiente = false;

  busqueda = '';
  filtroEstado = '';
  filtroPrioridad = '';

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  cargarIncidencias(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.incidenciasService
      .obtenerIncidencias(this.paginaActual, this.registrosPorPagina)
      .subscribe({
        next: (datos) => {
          this.incidencias = datos;
          this.hayPaginaSiguiente =
            datos.length === this.registrosPorPagina;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar incidencias:', err);
          this.error =
            'No se pudieron cargar las incidencias. Comprueba tu conexión e inténtalo de nuevo.';
          this.cargando = false;
          this.cdr.detectChanges();
        },
      });
  }

  get incidenciasFiltradas(): Incidencia[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.incidencias.filter((incidencia) => {
      const coincideTexto =
        !texto ||
        incidencia.codigo?.toLowerCase().includes(texto) ||
        incidencia.tipo?.toLowerCase().includes(texto) ||
        incidencia.sector?.toLowerCase().includes(texto) ||
        incidencia.dirreccion?.toLowerCase().includes(texto);

      const coincideEstado =
        !this.filtroEstado || incidencia.estado === this.filtroEstado;

      const coincidePrioridad =
        !this.filtroPrioridad ||
        incidencia.prioridad === this.filtroPrioridad;

      return coincideTexto && coincideEstado && coincidePrioridad;
    });
  }

  cambiarPagina(direccion: number): void {
    const nuevaPagina = this.paginaActual + direccion;

    if (nuevaPagina < 1) {
      return;
    }

    if (direccion > 0 && !this.hayPaginaSiguiente) {
      return;
    }

    this.paginaActual = nuevaPagina;
    this.cargarIncidencias();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = '';
    this.filtroPrioridad = '';
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'estado-pendiente';
      case 'en progreso':
        return 'estado-progreso';
      case 'resuelta':
        return 'estado-resuelta';
      default:
        return '';
    }
  }

  obtenerClasePrioridad(prioridad: string): string {
    switch (prioridad?.toLowerCase()) {
      case 'alta':
        return 'prioridad-alta';
      case 'media':
        return 'prioridad-media';
      case 'baja':
        return 'prioridad-baja';
      default:
        return '';
    }
  }
}
