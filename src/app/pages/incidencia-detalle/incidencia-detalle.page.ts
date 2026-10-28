
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { timeout } from 'rxjs';

import {
  AlertController,
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonText,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonImg,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea
} from '@ionic/angular';

import { IncidenciasService } from '../../services/incidencias.service';

import {
  Incidencia,
  EstadoIncidencia
} from '../../models/incidencia.model';

@Component({
  selector: 'app-incidencia-detalle',
  templateUrl: './incidencia-detalle.page.html',
  styleUrls: ['./incidencia-detalle.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonSpinner,
    IonText,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonImg,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTextarea
  ]
})
export class IncidenciaDetallePage implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly incidenciasService =
    inject(IncidenciasService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  private readonly alertController =
    inject(AlertController);

  incidencia: Incidencia | null = null;

  estadoSeleccionado: EstadoIncidencia = 'pendiente';
  observacion = '';

  cargando = true;
  guardando = false;
  error = '';
  mensaje = '';

  ngOnInit(): void {
    this.cargarIncidencia();
  }

  // Obtener la incidencia seleccionada desde MockAPI.
  cargarIncidencia(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se recibió el ID de la incidencia.';
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.incidenciasService
      .obtenerPorId(id)
      .pipe(timeout(15000))
      .subscribe({
        next: (datos) => {
          this.incidencia = {
            ...datos,
            // Se conserva el nombre exacto: dirreccion.
            dirreccion: datos.dirreccion || '',
            fotografia: datos.fotografia || '',
            observacion: datos.observacion || ''
          };

          console.log('Incidencia cargada:', this.incidencia);
          console.log('Estado recibido:', this.incidencia.estado);
          console.log('Estados permitidos:', this.estadosPermitidos);

          this.estadoSeleccionado =
            this.incidencia.estado;

          this.observacion =
            this.incidencia.observacion;

          this.cargando = false;
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error(
            'Error al obtener la incidencia:',
            err
          );

          this.error =
            err.name === 'TimeoutError'
              ? 'La solicitud tardó demasiado. Comprueba tu conexión.'
              : 'No se pudo cargar la incidencia. Verifica el ID y la conexión.';

          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  // Estados permitidos según el estado actual.

  get estadosPermitidos(): EstadoIncidencia[] {
    if (!this.incidencia) {
      return [];
    }

    // Normalizar el estado para reconocer variantes existentes.
    const estadoActual = this.incidencia.estado
      ?.trim()
      .toLowerCase();

    switch (estadoActual) {
      case 'pendiente':
        return [
          'pendiente',
          'en progreso',
          'resuelta'
        ];

      case 'en proceso':
      case 'en progreso':
        return [
          'en progreso',
          'resuelta'
        ];

      case 'resuelta':
        return ['resuelta'];

      default:
        console.warn(
          'Estado de incidencia no reconocido:',
          estadoActual
        );
        return [];
    }
  }


  // Mostrar una alerta emergente.
  private async mostrarAlerta(
    titulo: string,
    mensaje: string
  ): Promise<void> {
    const alerta = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar'],
      backdropDismiss: false
    });

    await alerta.present();
  }

  // Validar y guardar el estado y la observación.
  async guardarCambios(): Promise<void> {
    if (!this.incidencia?.id || this.guardando) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    // Impedir retroceder a un estado anterior.
    if (
      !this.estadosPermitidos.includes(
        this.estadoSeleccionado
      )
    ) {
      await this.mostrarAlerta(
        'Cambio de estado no permitido',
        'No puedes regresar a un estado anterior de la incidencia.'
      );

      return;
    }

    // La observación es obligatoria al resolver.
    if (
      this.estadoSeleccionado === 'resuelta' &&
      !this.observacion.trim()
    ) {
      await this.mostrarAlerta(
        'Observación obligatoria',
        'Para marcar esta incidencia como resuelta, debes escribir una observación que describa las acciones realizadas.'
      );

      // No se llama a MockAPI y no se abandona la pantalla.
      return;
    }

    this.guardando = true;

    this.incidenciasService.actualizarIncidencia(
      this.incidencia.id,
      {
        estado: this.estadoSeleccionado,
        observacion: this.observacion.trim()
      }
    ).subscribe({
      next: (actualizada) => {
        this.incidencia = {
          ...this.incidencia!,
          ...actualizada,

          // Mantener los campos de la incidencia.
          dirreccion:
            actualizada.dirreccion ||
            this.incidencia!.dirreccion ||
            '',

          fotografia:
            actualizada.fotografia ||
            this.incidencia!.fotografia ||
            '',

          observacion:
            actualizada.observacion || ''
        };

        this.estadoSeleccionado =
          this.incidencia.estado;

        this.observacion =
          this.incidencia.observacion || '';

        this.mensaje =
          'Los cambios se guardaron correctamente.';

        this.guardando = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(
          'Error al guardar los cambios:',
          err
        );

        this.guardando = false;
        this.cdr.detectChanges();

        void this.mostrarAlerta(
          'Error al guardar',
          'No se pudieron guardar los cambios. Comprueba tu conexión e inténtalo nuevamente.'
        );
      }
    });
  }

  // Abrir la ubicación registrada.
  abrirUbicacion(): void {
    if (
      this.incidencia?.latitud == null ||
      this.incidencia?.longitud == null
    ) {
      void this.mostrarAlerta(
        'Ubicación no disponible',
        'Esta incidencia no tiene coordenadas registradas.'
      );

      return;
    }

    const latitud = this.incidencia.latitud;
    const longitud = this.incidencia.longitud;

    const url =
      `https://www.google.com/maps?q=${latitud},${longitud}`;

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  // Volver a la lista de incidencias.
  volver(): void {
    this.router.navigate(['/incidencias']);
  }

  // Indica si un estado ya fue superado (para el timeline visual).
  isEstadoPasado(estado: EstadoIncidencia): boolean {
    const orden: EstadoIncidencia[] = ['pendiente', 'en progreso', 'resuelta'];
    const idxActual = orden.indexOf(this.incidencia?.estado as EstadoIncidencia);
    const idxEstado = orden.indexOf(estado);
    return idxActual > idxEstado;
  }
}
