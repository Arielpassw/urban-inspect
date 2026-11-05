
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertController } from '@ionic/angular';

import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner
} from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner
  ]
})
export class RegistroPage {

  nombre = '';
  email = '';
  password = '';
  confirmarPassword = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }

  async registrarUsuario() {

    if (
      !this.nombre.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmarPassword
    ) {
      await this.mostrarAlerta(
        'Campos incompletos',
        'Completa todos los campos para continuar.'
      );
      return;
    }

    if (this.password.length < 6) {
      await this.mostrarAlerta(
        'Contraseña inválida',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (this.password !== this.confirmarPassword) {
      await this.mostrarAlerta(
        'Contraseñas diferentes',
        'Las contraseñas no coinciden.'
      );
      return;
    }

    this.cargando = true;

    try {
      await this.authService.registro(
        this.email.trim(),
        this.password
      );

      await this.authService.actualizarNombre(
        this.nombre.trim()
      );

      // Cerrar la sesión creada automáticamente por Firebase
      await this.authService.logout();

      await this.mostrarAlerta(
        'Registro exitoso',
        'Tu cuenta de UrbanInspect ha sido creada correctamente.'
      );

      // Redirigir al usuario a la página de inicio de sesión
      await this.router.navigateByUrl('/login');

    } catch (error: any) {

      let mensaje = 'No se pudo crear la cuenta. Inténtalo nuevamente.';

      if (error.code === 'auth/email-already-in-use') {
        mensaje = 'Este correo electrónico ya está registrado.';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'El correo electrónico no tiene un formato válido.';
      } else if (error.code === 'auth/weak-password') {
        mensaje = 'La contraseña es demasiado débil.';
      } else if (error.code === 'auth/operation-not-allowed') {
        mensaje = 'El método de registro no está habilitado en Firebase.';
      }

      await this.mostrarAlerta('Error de registro', mensaje);

    } finally {
      this.cargando = false;
    }
  }

  private async mostrarAlerta(titulo: string, mensaje: string) {
    const alerta = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alerta.present();
  }
}
