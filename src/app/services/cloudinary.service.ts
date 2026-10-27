
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface CloudinaryRespuesta {
  secure_url: string;
  public_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  async subirFotografia(
    archivo: Blob,
    nombreArchivo: string = 'incidencia.jpg'
  ): Promise<string> {
    const cloudName = environment.cloudinaryCloudName;
    const uploadPreset = environment.cloudinaryUploadPreset;

    const formulario = new FormData();

    formulario.append('file', archivo, nombreArchivo);
    formulario.append('upload_preset', uploadPreset);
    formulario.append('folder', 'urbaninspect');

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const respuesta = await fetch(url, {
      method: 'POST',
      body: formulario,
    });

    if (!respuesta.ok) {
      throw new Error('No se pudo subir la fotografía a Cloudinary.');
    }

    const resultado =
      (await respuesta.json()) as CloudinaryRespuesta;

    if (!resultado.secure_url) {
      throw new Error('Cloudinary no devolvió la URL de la fotografía.');
    }

    return resultado.secure_url;
  }
}
