
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

interface ClimaRespuesta {
  current?: {
    time: string;
    temperature_2m: number;
    precipitation: number;
    weather_code: number;
  };
  hourly?: {
    time: string[];
    precipitation: number[];
  };
}

export interface ResultadoClima {
  temperatura: number | null;
  precipitacionUltimaHora: number | null;
  condicion: string;
  advertencia: boolean;
  disponible: boolean;
  mensaje: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClimaService {
  constructor(private http: HttpClient) {}

  async consultarClima(
    latitud: number,
    longitud: number
  ): Promise<ResultadoClima> {
    try {
      const url = environment.climaApiUrl;

      const respuesta = await firstValueFrom(
        this.http.get<ClimaRespuesta>(url, {
          params: {
            latitude: latitud,
            longitude: longitud,
            current: 'temperature_2m,precipitation,weather_code',
            hourly: 'precipitation',
            past_hours: '1',
            forecast_hours: '1',
            timezone: 'America/Guayaquil',
          },
        })
      );

      const actual = respuesta.current;
      const horas = respuesta.hourly;

      if (!actual || !horas) {
        throw new Error('La respuesta del clima está incompleta.');
      }

      const horaActual = new Date(actual.time).getTime();

      // Buscar la precipitación horaria más reciente
      // correspondiente a una hora que ya haya terminado.
      const indiceHora = horas.time.reduce(
        (indiceMejor, hora, indice) => {
          const tiempo = new Date(hora).getTime();

          if (
            tiempo <= horaActual &&
            (indiceMejor === -1 ||
              tiempo > new Date(horas.time[indiceMejor]).getTime())
          ) {
            return indice;
          }

          return indiceMejor;
        },
        -1
      );

      const precipitacion =
        indiceHora >= 0 ? horas.precipitation[indiceHora] : null;

      const condicion = this.obtenerCondicion(actual.weather_code);

      const advertencia =
        precipitacion !== null && precipitacion > 5;

      return {
        temperatura: actual.temperature_2m,
        precipitacionUltimaHora: precipitacion,
        condicion,
        advertencia,
        disponible: true,
        mensaje: advertencia
          ? 'La precipitación supera los 5 mm. Se recomienda precaución.'
          : 'Consulta meteorológica completada.',
      };
    } catch {
      return {
        temperatura: null,
        precipitacionUltimaHora: null,
        condicion: 'No disponible',
        advertencia: false,
        disponible: false,
        mensaje:
          'No se pudo consultar el clima. Puedes continuar con el registro.',
      };
    }
  }

  private obtenerCondicion(codigo: number): string {
    if (codigo === 0) return 'Despejado';
    if ([1, 2, 3].includes(codigo)) return 'Parcialmente nublado o nublado';
    if ([45, 48].includes(codigo)) return 'Niebla';
    if ([51, 53, 55, 56, 57].includes(codigo)) return 'Llovizna';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) {
      return 'Lluvia';
    }
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return 'Nieve';
    if ([95, 96, 99].includes(codigo)) return 'Tormenta';
    return 'Condición desconocida';
  }
}
