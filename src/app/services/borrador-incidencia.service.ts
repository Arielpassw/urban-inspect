
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import {
  Directory,
  Encoding,
  Filesystem,
} from '@capacitor/filesystem';

import { PrioridadIncidencia } from '../models/incidencia.model';

const CLAVE_BORRADOR = 'urbaninspect_borrador_incidencia';
const ARCHIVO_FOTOGRAFIA = 'borrador-incidencia.jpg';

export interface BorradorIncidencia {
  tipo: string;
  descripcion: string;
  dirreccion: string;
  sector: string;
  prioridad: PrioridadIncidencia;
  latitud: number | null;
  longitud: number | null;
  tieneFotografia: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BorradorIncidenciaService {
  async guardar(
    borrador: BorradorIncidencia,
    fotografia?: Blob | null,
  ): Promise<void> {
    let tieneFotografia = false;

    if (fotografia) {
      const base64 = await this.blobABase64(fotografia);

      await Filesystem.writeFile({
        path: ARCHIVO_FOTOGRAFIA,
        data: base64,
        directory: Directory.Data,
        recursive: true,
      });

      tieneFotografia = true;
    } else {
      // Si no hay foto en el borrador, no conservar una foto anterior.
      await this.eliminarFotografia();
    }

    const datos: BorradorIncidencia = {
      ...borrador,
      tieneFotografia,
    };

    await Preferences.set({
      key: CLAVE_BORRADOR,
      value: JSON.stringify(datos),
    });
  }

  async obtener(): Promise<BorradorIncidencia | null> {
    const resultado = await Preferences.get({
      key: CLAVE_BORRADOR,
    });

    if (!resultado.value) {
      return null;
    }

    try {
      const datos: unknown = JSON.parse(resultado.value);

      if (
        typeof datos !== 'object' ||
        datos === null ||
        !('tipo' in datos) ||
        !('descripcion' in datos) ||
        !('dirreccion' in datos) ||
        !('sector' in datos) ||
        !('prioridad' in datos) ||
        !('latitud' in datos) ||
        !('longitud' in datos) ||
        !('tieneFotografia' in datos)
      ) {
        return null;
      }

      return datos as BorradorIncidencia;
    } catch {
      return null;
    }
  }

  async obtenerFotografia(): Promise<Blob | null> {
    try {
      const archivo = await Filesystem.readFile({
        path: ARCHIVO_FOTOGRAFIA,
        directory: Directory.Data,
      });

      if (typeof archivo.data !== 'string') {
        return null;
      }

      const respuesta = await fetch(
        `data:image/jpeg;base64,${archivo.data}`,
      );

      return await respuesta.blob();
    } catch {
      return null;
    }
  }

  async eliminar(): Promise<void> {
    await Preferences.remove({
      key: CLAVE_BORRADOR,
    });

    await this.eliminarFotografia();
  }

  private async eliminarFotografia(): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: ARCHIVO_FOTOGRAFIA,
        directory: Directory.Data,
      });
    } catch {
      // El archivo puede no existir todavía.
    }
  }

  private async blobABase64(blob: Blob): Promise<string> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const lector = new FileReader();

      lector.onload = () => {
        if (typeof lector.result === 'string') {
          resolve(lector.result);
        } else {
          reject(new Error('No se pudo leer la fotografía.'));
        }
      };

      lector.onerror = () => {
        reject(new Error('Error al preparar la fotografía.'));
      };

      lector.readAsDataURL(blob);
    });

    return dataUrl.split(',')[1];
  }
}
