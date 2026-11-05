import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertController } from '@ionic/angular';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner
} from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonSpinner
  ]
})
export class LoginPage {

  email = '';
  password = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async iniciarSesion() {
    if (!this.email.trim() || !this.password) {
      await this.mostrarAlerta(
        'Campos incompletos',
        'Ingresa tu correo electrónico y contraseña.'
      );
      return;
    }

    this.cargando = true;

    try {
      await this.authService.login(
        this.email.trim(),
        this.password
      );

      await this.router.navigateByUrl('/dashboard');

    } catch (error: any) {
      let mensaje = 'No se pudo iniciar sesión. Inténtalo nuevamente.';

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        mensaje = 'El correo electrónico o la contraseña son incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'El correo electrónico no tiene un formato válido.';
      } else if (error.code === 'auth/too-many-requests') {
        mensaje = 'Demasiados intentos. Inténtalo más tarde.';
      }

      await this.mostrarAlerta('Error de inicio de sesión', mensaje);

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