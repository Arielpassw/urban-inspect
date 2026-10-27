
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  AlertController,
  ToastController,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonList,
  IonBadge,
  IonSpinner,
  IonText,
} from '@ionic/angular';

import { IncidenciasService } from '../../services/incidencias.service';
import { SeguimientoService } from '../../services/seguimiento.service';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonList,
    IonBadge,
    IonSpinner,
    IonText,
  ],
})
export class SeguimientoPage implements OnInit {
  private incidenciasService = inject(IncidenciasService);
  private seguimientoService = inject(SeguimientoService);
  private cdr = inject(ChangeDetectorRef);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  codigoSeleccionado = '';
  codigosSeguimiento: string[] = [];
  incidencias: Incidencia[] = [];

  cargando = false;
  inicializando = true;
  error = '';

  async ngOnInit(): Promise<void> {
    try {
      await this.seguimientoService.inicializar();

      this.codigosSeguimiento =
        this.seguimientoService.obtenerCodigos();

      this.cargarIncidencias();
    } catch (error) {
      console.error('Error al iniciar seguimiento:', error);

      this.error =
        'No se pudo cargar el seguimiento guardado en el dispositivo.';

      this.inicializando = false;
      this.cdr.detectChanges();
    }
  }

  cargarIncidencias(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    // Carga hasta 100 registros de MockAPI.
    this.incidenciasService.obtenerIncidencias(1, 100).subscribe({
      next: (datos) => {
        this.incidencias = datos;
        this.cargando = false;
        this.inicializando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al consultar incidencias:', err);

        this.error =
          'No se pudieron cargar las incidencias. Comprueba tu conexión.';

        this.cargando = false;
        this.inicializando = false;
        this.cdr.detectChanges();
      },
    });
  }

  get incidenciasDisponibles(): Incidencia[] {
    return this.incidencias.filter(
      (incidencia) =>
        !this.codigosSeguimiento.includes(incidencia.codigo)
    );
  }

  get incidenciasEnSeguimiento(): Incidencia[] {
    return this.codigosSeguimiento
      .map((codigo) =>
        this.incidencias.find(
          (incidencia) => incidencia.codigo === codigo
        )
      )
      .filter(
        (incidencia): incidencia is Incidencia =>
          incidencia !== undefined
      );
  }

  get codigosNoEncontrados(): string[] {
    return this.codigosSeguimiento.filter(
      (codigo) =>
        !this.incidencias.some(
          (incidencia) => incidencia.codigo === codigo
        )
    );
  }

  async agregarSeguimiento(): Promise<void> {
    const codigo = this.codigoSeleccionado;

    if (!codigo) {
      await this.mostrarMensaje(
        'Selecciona una incidencia de la lista.'
      );
      return;
    }

    const incidencia = this.incidenciasDisponibles.find(
      (item) => item.codigo === codigo
    );

    if (!incidencia) {
      await this.mostrarMensaje(
        'La incidencia seleccionada ya no está disponible.'
      );
      return;
    }

    try {
      await this.seguimientoService.agregar(incidencia.codigo);

      this.codigosSeguimiento =
        this.seguimientoService.obtenerCodigos();

      this.codigoSeleccionado = '';
      this.cdr.detectChanges();

      await this.mostrarMensaje(
        'Incidencia agregada al seguimiento.'
      );
    } catch (error) {
      console.error('Error al guardar seguimiento:', error);

      await this.mostrarMensaje(
        'No se pudo guardar el seguimiento en el dispositivo.'
      );
    }
  }

  async quitarSeguimiento(
    incidencia: Incidencia
  ): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Quitar seguimiento',
      message: `¿Deseas dejar de seguir la incidencia ${incidencia.codigo}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Quitar',
          role: 'destructive',
          handler: () => {
            void this.confirmarQuitar(incidencia.codigo);
          },
        },
      ],
    });

    await alerta.present();
  }

  private async confirmarQuitar(
    codigo: string
  ): Promise<void> {
    try {
      await this.seguimientoService.quitar(codigo);

      this.codigosSeguimiento =
        this.seguimientoService.obtenerCodigos();

      this.cdr.detectChanges();

      await this.mostrarMensaje(
        'Incidencia quitada del seguimiento.'
      );
    } catch (error) {
      console.error('Error al quitar seguimiento:', error);

      await this.mostrarMensaje(
        'No se pudo quitar la incidencia del seguimiento.'
      );
    }
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

  private async mostrarMensaje(
    mensaje: string
  ): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
    });

    await toast.present();
  }

  async quitarCodigoNoEncontrado(codigo: string): Promise<void> {
    await this.confirmarQuitar(codigo);
  }
}
