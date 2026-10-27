import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-incidencia-detalle',
  templateUrl: './incidencia-detalle.page.html',
  styleUrls: ['./incidencia-detalle.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class IncidenciaDetallePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
