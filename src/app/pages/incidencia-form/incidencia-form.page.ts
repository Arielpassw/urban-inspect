
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import {
  AlertController,
  LoadingController,
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
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonImg,
  IonNote,
} from '@ionic/angular';

import {
  Camera,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';

import { IncidenciasService } from '../../services/incidencias.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import {
  UbicacionService,
  Coordenadas,
} from '../../services/ubicacion.service';
import {
  ClimaService,
  ResultadoClima,
} from '../../services/clima.service';
import {
  Incidencia,
  PrioridadIncidencia,
} from '../../models/incidencia.model';

import { BorradorIncidenciaService } from '../../services/borrador-incidencia.service';

@Component({
  selector: 'app-incidencia-form',
  standalone: true,
  templateUrl: './incidencia-form.page.html',
  styleUrls: ['./incidencia-form.page.scss'],
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
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonImg,
    IonNote,
  ],
})
export class IncidenciaFormPage implements OnInit {
  private readonly incidenciasService = inject(IncidenciasService);
  private readonly cloudinaryService = inject(CloudinaryService);
  private readonly ubicacionService = inject(UbicacionService);
  private readonly climaService = inject(ClimaService);
  private readonly alertController = inject(AlertController);
  private readonly loadingController = inject(LoadingController);
  private readonly toastController = inject(ToastController);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private latitudClima: number | null = null;
  private longitudClima: number | null = null;
  private borradorService = inject(BorradorIncidenciaService);
  private borradorInicializado = false;
  private temporizadorBorrador: ReturnType<typeof setTimeout> | null = null;

  tipo = '';
  descripcion = '';
  dirreccion = '';
  sector = '';
  prioridad: PrioridadIncidencia = 'media';

  latitud: number | null = null;
  longitud: number | null = null;

  fotografiaBlob: Blob | null = null;
  fotografiaVistaPrevia: string | null = null;

  clima: ResultadoClima | null = null;

  consultandoUbicacion = false;
  consultandoClima = false;
  guardando = false;

  readonly tiposIncidencia = [
    { valor: 'bache', etiqueta: 'Bache' },
    { valor: 'alumbrado', etiqueta: 'Alumbrado público' },
    { valor: 'alcantarillado', etiqueta: 'Alcantarillado' },
    { valor: 'señalizacion', etiqueta: 'Señalización' },
    { valor: 'acera', etiqueta: 'Acera o vereda' },
    { valor: 'calzada', etiqueta: 'Daño en la calzada' },
    { valor: 'otro', etiqueta: 'Otro' },
  ];

  // Inicializar el borrador al cargar la página.
  async ngOnInit(): Promise<void> {
    await this.recuperarBorrador();
  }

  // Guardar el borrador al salir de la página.
  private obtenerDatosBorrador() {
    return {
      tipo: this.tipo,
      descripcion: this.descripcion,
      dirreccion: this.dirreccion,
      sector: this.sector,
      prioridad: this.prioridad,
      latitud: this.latitud,
      longitud: this.longitud,
      tieneFotografia: !!this.fotografiaBlob,
    };
  }

  private hayDatosBorrador(): boolean {
    return !!(
      this.tipo.trim() ||
      this.descripcion.trim() ||
      this.dirreccion.trim() ||
      this.sector.trim() ||
      this.fotografiaBlob ||
      this.latitud !== null ||
      this.longitud !== null
    );
  }

  programarGuardadoBorrador(): void {
    if (!this.borradorInicializado || this.guardando) {
      return;
    }

    if (this.temporizadorBorrador !== null) {
      clearTimeout(this.temporizadorBorrador);
    }

    this.temporizadorBorrador = setTimeout(() => {
      void this.guardarBorrador();
    }, 500);
  }

  private async guardarBorrador(): Promise<void> {
    if (!this.borradorInicializado || this.guardando) {
      return;
    }

    try {
      if (!this.hayDatosBorrador()) {
        await this.borradorService.eliminar();
        return;
      }

      await this.borradorService.guardar(this.obtenerDatosBorrador());
    } catch (error) {
      console.error('No se pudo guardar el borrador:', error);
    }
  }

  private async recuperarBorrador(): Promise<void> {
    try {
      const borrador = await this.borradorService.obtener();

      if (!borrador) {
        this.borradorInicializado = true;
        return;
      }

      const alerta = await this.alertController.create({
        header: 'Borrador encontrado',
        message:
          'Tienes una incidencia sin terminar. ¿Deseas continuar donde la dejaste?',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Descartar borrador',
            role: 'destructive',
            handler: async () => {
              await this.descartarBorrador();
            },
          },
          {
            text: 'Continuar borrador',
            role: 'confirm',
            handler: async () => {
              await this.continuarBorrador(borrador);
            },
          },
        ],
      });

      await alerta.present();
      const resultado = await alerta.onDidDismiss();

      this.borradorInicializado = true;

      if (resultado.role === 'confirm') {
        this.programarGuardadoBorrador();
      }
    } catch (error) {
      console.error('No se pudo recuperar el borrador:', error);
      this.borradorInicializado = true;

      await this.mostrarMensaje(
        'No se pudo recuperar el borrador guardado.',
      );
    }
  }

  private async continuarBorrador(
    borrador: import('../../services/borrador-incidencia.service').BorradorIncidencia,
  ): Promise<void> {
    this.tipo = borrador.tipo;
    this.descripcion = borrador.descripcion;
    this.dirreccion = borrador.dirreccion;
    this.sector = borrador.sector;
    this.prioridad = borrador.prioridad;
    this.latitud = borrador.latitud;
    this.longitud = borrador.longitud;

    if (borrador.tieneFotografia) {
      const fotografia = await this.borradorService.obtenerFotografia();

      if (fotografia) {
        this.fotografiaBlob = fotografia;
        this.fotografiaVistaPrevia = URL.createObjectURL(fotografia);
      } else {
        await this.mostrarMensaje(
          'No se pudo recuperar la fotografía. Puedes tomar otra.',
        );
      }
    }

    this.cdr.detectChanges();
  }

  private async descartarBorrador(): Promise<void> {
    try {
      await this.borradorService.eliminar();

      this.tipo = '';
      this.descripcion = '';
      this.dirreccion = '';
      this.sector = '';
      this.prioridad = 'media';
      this.latitud = null;
      this.longitud = null;
      this.fotografiaBlob = null;
      this.fotografiaVistaPrevia = null;
      this.clima = null;

      this.cdr.detectChanges();
      await this.mostrarMensaje('Borrador descartado.');
    } catch (error) {
      console.error('No se pudo descartar el borrador:', error);
      await this.mostrarMensaje('No se pudo eliminar el borrador.');
    }
  }


  async tomarFotografia(): Promise<void> {
    try {
      const foto = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false,
      });

      if (!foto.webPath) {
        throw new Error('La cámara no devolvió una imagen.');
      }

      const respuesta = await fetch(foto.webPath);

      if (!respuesta.ok) {
        throw new Error('No se pudo leer la fotografía.');
      }

      this.fotografiaBlob = await respuesta.blob();
      this.fotografiaVistaPrevia = foto.webPath;

      await this.borradorService.guardar(
        this.obtenerDatosBorrador(),
        this.fotografiaBlob,
      );

      await this.mostrarMensaje('Fotografía capturada correctamente.');
    } catch (error) {
      console.error('Error al tomar la fotografía:', error);

      // Si el usuario canceló la cámara, no se pierde el formulario.
      if (this.esCancelacionCamara(error)) {
        return;
      }

      await this.mostrarAlerta(
        'Cámara no disponible',
        'No se pudo abrir la cámara. Verifica los permisos de la aplicación e inténtalo nuevamente.',
      );
    } finally {
      this.cdr.detectChanges();
    }
  }

  cancelarFotografia(): void {
    this.fotografiaBlob = null;
    this.fotografiaVistaPrevia = null;
    void this.borradorService.guardar(
      this.obtenerDatosBorrador(),
      null,
    );
    this.cdr.detectChanges();
  }

  private esCancelacionCamara(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const mensaje = error.message.toLowerCase();

    return (
      mensaje.includes('cancel') ||
      mensaje.includes('user denied') ||
      mensaje.includes('user cancelled')
    );
  }

  async obtenerUbicacion(): Promise<void> {
    this.consultandoUbicacion = true;
    this.clima = null;

    try {
      const ubicacion: Coordenadas =
        await this.ubicacionService.obtenerUbicacion();

      this.latitud = ubicacion.latitud;
      this.longitud = ubicacion.longitud;

      this.cdr.detectChanges();

      await this.consultarClima();
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);

      const mensaje =
        error instanceof Error
          ? error.message
          : 'No se pudo obtener la ubicación.';

      await this.mostrarAlerta(
        'Ubicación no disponible',
        `${mensaje} Puedes ingresar las coordenadas manualmente.`,
      );
    } finally {
      this.consultandoUbicacion = false;
      this.cdr.detectChanges();
    }
  }

  async consultarClima(): Promise<void> {
    if (this.latitud === null || this.longitud === null) {
      await this.mostrarAlerta(
        'Coordenadas requeridas',
        'Obtén tu ubicación mediante GPS o ingresa manualmente la latitud y longitud.',
      );
      return;
    }

    if (
      !Number.isFinite(this.latitud) ||
      !Number.isFinite(this.longitud) ||
      this.latitud < -90 ||
      this.latitud > 90 ||
      this.longitud < -180 ||
      this.longitud > 180
    ) {
      await this.mostrarAlerta(
        'Coordenadas inválidas',
        'Verifica la latitud y longitud antes de consultar el clima.',
      );
      return;
    }

    this.consultandoClima = true;

    try {
      const latitudConsultada = this.latitud;
      const longitudConsultada = this.longitud;

      this.clima = await this.climaService.consultarClima(
        latitudConsultada,
        longitudConsultada,
      );

      this.latitudClima = latitudConsultada;
      this.longitudClima = longitudConsultada;

      if (this.clima.advertencia) {
        await this.mostrarAlerta(
          'Aviso meteorológico',
          `${this.clima.mensaje} Puedes continuar con el registro de la incidencia.`,
        );
      } else if (!this.clima.disponible) {
        await this.mostrarMensaje(
          'El clima no está disponible. Puedes continuar con el registro.',
        );
      }
    } catch (error) {
      console.error('Error al consultar el clima:', error);

      this.clima = {
        temperatura: null,
        precipitacionUltimaHora: null,
        condicion: 'No disponible',
        advertencia: false,
        disponible: false,
        mensaje:
          'No se pudo consultar el clima. Puedes continuar con el registro.',
      };
    } finally {
      this.consultandoClima = false;
      this.cdr.detectChanges();
    }
  }

  private validarFormulario(): boolean {
    if (!this.tipo.trim()) {
      void this.mostrarAlerta(
        'Campo obligatorio',
        'Selecciona el tipo de incidencia.',
      );
      return false;
    }

    if (!this.descripcion.trim()) {
      void this.mostrarAlerta(
        'Campo obligatorio',
        'Ingresa una descripción de la incidencia.',
      );
      return false;
    }

    if (!this.dirreccion.trim()) {
      void this.mostrarAlerta(
        'Campo obligatorio',
        'Ingresa la dirección de la incidencia.',
      );
      return false;
    }

    if (!this.sector.trim()) {
      void this.mostrarAlerta(
        'Campo obligatorio',
        'Ingresa el sector donde se encuentra la incidencia.',
      );
      return false;
    }

    if (!['baja', 'media', 'alta'].includes(this.prioridad)) {
      void this.mostrarAlerta(
        'Prioridad inválida',
        'Selecciona una prioridad válida.',
      );
      return false;
    }

    if (this.prioridad === 'alta' && !this.fotografiaBlob) {
      void this.mostrarAlerta(
        'Fotografía requerida',
        'Las incidencias de prioridad alta deben tener una fotografía.',
      );
      return false;
    }

    if (
      this.tipo.toLowerCase() === 'bache' &&
      (this.latitud === null || this.longitud === null)
    ) {
      void this.mostrarAlerta(
        'Ubicación requerida',
        'Para registrar un bache, obtén la ubicación GPS o ingresa las coordenadas manualmente.',
      );
      return false;
    }

    const tieneLatitud = this.latitud !== null;
    const tieneLongitud = this.longitud !== null;

    if (tieneLatitud !== tieneLongitud) {
      void this.mostrarAlerta(
        'Ubicación incompleta',
        'Debes ingresar tanto la latitud como la longitud.',
      );
      return false;
    }

    if (
      tieneLatitud &&
      tieneLongitud &&
      (
        !Number.isFinite(this.latitud) ||
        !Number.isFinite(this.longitud) ||
        this.latitud! < -90 ||
        this.latitud! > 90 ||
        this.longitud! < -180 ||
        this.longitud! > 180
      )
    ) {
      void this.mostrarAlerta(
        'Coordenadas inválidas',
        'La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180.',
      );
      return false;
    }

    return true;
  }

  async guardarIncidencia(): Promise<void> {
    if (this.guardando || !this.validarFormulario()) {
      return;
    }

    if (
      this.latitud !== null &&
      this.longitud !== null &&
      (
        this.clima === null ||
        this.latitudClima !== this.latitud ||
        this.longitudClima !== this.longitud
      )
    ) {
      await this.consultarClima();
    }

    this.guardando = true;

    const loading = await this.loadingController.create({
      message: 'Guardando incidencia...',
      spinner: 'crescent',
      backdropDismiss: false,
    });

    await loading.present();

    try {
      let fotografiaUrl = '';

      if (this.fotografiaBlob) {
        fotografiaUrl = await this.cloudinaryService.subirFotografia(
          this.fotografiaBlob,
          `incidencia-${Date.now()}.jpg`,
        );
      }

      const nuevaIncidencia: Omit<Incidencia, 'id'> = {
        codigo: `INC-${Date.now()}`,
        tipo: this.tipo,
        descripcion: this.descripcion.trim(),
        dirreccion: this.dirreccion.trim(),
        sector: this.sector.trim(),
        prioridad: this.prioridad,
        estado: 'pendiente',
        fotografia: fotografiaUrl,
        latitud: this.latitud,
        longitud: this.longitud,
        observacion: '',
        fecha: new Date().toISOString(),
      };

      await new Promise<void>((resolve, reject) => {
        this.incidenciasService.crearIncidencia(nuevaIncidencia).subscribe({
          next: () => resolve(),
          error: (error) => reject(error),
        });
      });

      await loading.dismiss();
      await this.borradorService.eliminar();
      await this.mostrarMensaje('Incidencia registrada correctamente.');
      await this.router.navigate(['/incidencias']);
    } catch (error) {
      console.error('Error al guardar la incidencia:', error);

      await loading.dismiss();

      const detalle =
        error instanceof Error
          ? error.message
          : 'Error desconocido. Revisa la consola.';

      await this.mostrarAlerta(
        'No se pudo guardar',
        detalle
      );
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  private async mostrarMensaje(mensaje: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
    });

    await toast.present();
  }

  private async mostrarAlerta(
    titulo: string,
    mensaje: string,
  ): Promise<void> {
    const alerta = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar'],
    });

    await alerta.present();
  }

  // Limpiar el clima si las coordenadas cambian.
  coordenadasCambiaron(): void {
    this.clima = null;
    this.latitudClima = null;
    this.longitudClima = null;
  }

  // Salir del formulario y guardar el borrador.
  async salirDelFormulario(): Promise<void> {
    if (this.temporizadorBorrador !== null) {
      clearTimeout(this.temporizadorBorrador);
      this.temporizadorBorrador = null;
    }

    await this.guardarBorrador();
    await this.router.navigate(['/incidencias']);
  }
}
