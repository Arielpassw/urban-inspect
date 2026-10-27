
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const CLAVE_SEGUIMIENTO = 'urbaninspect_seguimiento';

@Injectable({
  providedIn: 'root',
})
export class SeguimientoService {
  private codigos: string[] = [];
  private inicializado = false;

  async inicializar(): Promise<void> {
    if (this.inicializado) {
      return;
    }

    const resultado = await Preferences.get({
      key: CLAVE_SEGUIMIENTO,
    });

    if (resultado.value) {
      try {
        const datos: unknown = JSON.parse(resultado.value);

        this.codigos = Array.isArray(datos)
          ? datos.filter(
              (codigo): codigo is string =>
                typeof codigo === 'string'
            )
          : [];
      } catch {
        this.codigos = [];
      }
    }

    this.inicializado = true;
  }

  obtenerCodigos(): string[] {
    return [...this.codigos];
  }

  async agregar(codigo: string): Promise<void> {
    await this.inicializar();

    const codigoLimpio = codigo.trim();

    if (!codigoLimpio) {
      throw new Error('El código de incidencia es obligatorio.');
    }

    if (!this.codigos.includes(codigoLimpio)) {
      this.codigos.push(codigoLimpio);
      await this.guardar();
    }
  }

  async quitar(codigo: string): Promise<void> {
    await this.inicializar();

    this.codigos = this.codigos.filter(
      (item) => item !== codigo
    );

    await this.guardar();
  }

  private async guardar(): Promise<void> {
    await Preferences.set({
      key: CLAVE_SEGUIMIENTO,
      value: JSON.stringify(this.codigos),
    });
  }
}
