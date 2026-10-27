
import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {

  async obtenerUbicacion(): Promise<Coordenadas> {
    const permisos = await Geolocation.checkPermissions();

    if (permisos.location !== 'granted') {
      const resultado = await Geolocation.requestPermissions();

      if (resultado.location !== 'granted') {
        throw new Error(
          'Permiso de ubicación denegado. Puedes ingresar las coordenadas manualmente.'
        );
      }
    }

    const posicion: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
    };
  }
}
