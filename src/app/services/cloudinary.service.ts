
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface CloudinaryRespuesta {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {

  async subirFotografia(
    archivo: Blob,
    nombreArchivo: string = 'incidencia.jpg'
  ): Promise<string> {

    if (!archivo || archivo.size === 0) {
      throw new Error('La fotografía está vacía o no se pudo leer.');
    }

    const cloudName = environment.cloudinaryCloudName;
    const uploadPreset = environment.cloudinaryUploadPreset;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        'Falta la configuración de Cloudinary en environment.'
      );
    }

    const formulario = new FormData();

    formulario.append('file', archivo, nombreArchivo);
    formulario.append('upload_preset', uploadPreset);
    formulario.append('folder', 'urbaninspect');

    const url =
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    let respuesta: Response;

    try {
      respuesta = await fetch(url, {
        method: 'POST',
        body: formulario,
      });
    } catch (error) {
      console.error('Error de conexión con Cloudinary:', error);

      throw new Error(
        'No se pudo conectar con Cloudinary. Comprueba tu conexión a Internet.'
      );
    }

    const textoRespuesta = await respuesta.text();

    let resultado: CloudinaryRespuesta;

    try {
      resultado = JSON.parse(textoRespuesta) as CloudinaryRespuesta;
    } catch {
      console.error(
        'Respuesta no válida de Cloudinary:',
        textoRespuesta
      );

      throw new Error(
        `Cloudinary devolvió una respuesta no válida (${respuesta.status}).`
      );
    }

    if (!respuesta.ok) {
      console.error('Cloudinary rechazó la fotografía:', {
        status: respuesta.status,
        respuesta: resultado,
        tipoArchivo: archivo.type,
        tamanoBytes: archivo.size,
      });

      throw new Error(
        resultado.error?.message ||
        `Cloudinary rechazó la imagen (${respuesta.status}).`
      );
    }

    if (!resultado.secure_url) {
      console.error('Cloudinary no devolvió secure_url:', resultado);

      throw new Error(
        'La fotografía se recibió, pero Cloudinary no devolvió su URL.'
      );
    }

    console.log('Fotografía subida correctamente:', {
      publicId: resultado.public_id,
      tipoArchivo: archivo.type,
      tamanoBytes: archivo.size,
    });

    return resultado.secure_url;
  }
}
