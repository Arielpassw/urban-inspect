
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

interface ClimaRespuesta {
  current?: {
    time: string;
    temperature_2m: number;
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
      const respuesta = await firstValueFrom(
        this.http.get<ClimaRespuesta>(environment.climaApiUrl, {
          params: {
            latitude: latitud,
            longitude: longitud,
            current: 'temperature_2m,weather_code',
            hourly: 'precipitation',
            past_hours: '2',
            forecast_hours: '1',
            timezone: 'America/Guayaquil',
          },
        })
      );

      const actual = respuesta.current;
      const horas = respuesta.hourly;

      if (
        !actual ||
        !horas ||
        !Array.isArray(horas.time) ||
        !Array.isArray(horas.precipitation) ||
        horas.time.length !== horas.precipitation.length
      ) {
        throw new Error('La respuesta meteorológica está incompleta.');
      }

      const horaActual = new Date(actual.time).getTime();

      if (!Number.isFinite(horaActual)) {
        throw new Error('La hora meteorológica no es válida.');
      }

      // Buscar el registro horario más reciente que no sea futuro.
      let indiceHora = -1;
      let tiempoMasReciente = -Infinity;

      for (let i = 0; i < horas.time.length; i++) {
        const tiempo = new Date(horas.time[i]).getTime();

        if (
          Number.isFinite(tiempo) &&
          tiempo <= horaActual &&
          tiempo > tiempoMasReciente
        ) {
          indiceHora = i;
          tiempoMasReciente = tiempo;
        }
      }

      const valorPrecipitacion =
        indiceHora >= 0
          ? horas.precipitation[indiceHora]
          : null;

      const precipitacion =
        valorPrecipitacion !== null &&
        Number.isFinite(valorPrecipitacion) &&
        valorPrecipitacion >= 0
          ? valorPrecipitacion
          : null;

      const condicion = this.obtenerCondicion(actual.weather_code);

      const advertencia =
        precipitacion !== null && precipitacion > 5;

      return {
        temperatura: Number.isFinite(actual.temperature_2m)
          ? actual.temperature_2m
          : null,
        precipitacionUltimaHora: precipitacion,
        condicion,
        advertencia,
        disponible: true,
        mensaje:
          precipitacion === null
            ? 'No se pudo determinar la precipitación de la última hora.'
            : advertencia
              ? 'La precipitación supera los 5 mm. Se recomienda precaución.'
              : 'Consulta meteorológica completada.',
      };
    } catch (error) {
      console.error('Error consultando Open-Meteo:', error);

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

    if ([71, 73, 75, 77, 85, 86].includes(codigo)) {
      return 'Nieve';
    }

    if ([95, 96, 99].includes(codigo)) return 'Tormenta';

    return 'Condición desconocida';
  }
}
