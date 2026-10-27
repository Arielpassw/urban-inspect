
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Incidencia } from '../models/incidencia.model';

@Injectable({
    providedIn: 'root',
})
export class IncidenciasService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.mockApiUrl;

    // Consultar incidencias con paginación de 5 registros
    obtenerIncidencias(
        pagina: number = 1,
        limite: number = 5
    ): Observable<Incidencia[]> {
        const params = new HttpParams()
            .set('page', pagina)
            .set('limit', limite);

        return this.http.get<Incidencia[]>(this.apiUrl, {
            params,
        });
    }


    // Consultar una incidencia por su ID
    obtenerPorId(id: string): Observable<Incidencia> {
        return this.http.get<Incidencia>(`${this.apiUrl}/${id}`);
    }

    // Registrar una nueva incidencia
    crearIncidencia(
        incidencia: Omit<Incidencia, 'id'>
    ): Observable<Incidencia> {
        return this.http.post<Incidencia>(this.apiUrl, incidencia);
    }

    // Actualizar una incidencia
    actualizarIncidencia(
        id: string,
        cambios: Partial<Incidencia>
    ): Observable<Incidencia> {
        return this.http.patch<Incidencia>(
            `${this.apiUrl}/${id}`,
            cambios
        );
    }

    // Eliminar una incidencia
    eliminarIncidencia(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
