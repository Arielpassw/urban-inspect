
import { Injectable } from '@angular/core';

import {
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    getAuth,
    updateProfile,
} from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private app = initializeApp(environment.firebase);
    private auth: Auth = getAuth(this.app);
    constructor() { }

    // Registrar un usuario
    async registro(email: string, password: string) {
        return await createUserWithEmailAndPassword(
            this.auth,
            email,
            password
        );
    }

    // Iniciar sesión
    async login(email: string, password: string) {
        return await signInWithEmailAndPassword(
            this.auth,
            email,
            password
        );
    }

    // Cerrar sesión
    async logout() {
        return await signOut(this.auth);
    }

    // Obtener el usuario autenticado
    obtenerUsuario(): Promise<User | null> {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(
                this.auth,
                (user) => {
                    unsubscribe();
                    resolve(user);
                }
            );
        });
    }

    // Actualizar el perfil del usuario
    async actualizarNombre(nombre: string) {
        const usuario = this.auth.currentUser;

        if (!usuario) {
            throw new Error('No hay un usuario autenticado');
        }

        return updateProfile(usuario, {
            displayName: nombre
        });
    }

    // Escuchar cambios en la sesión
    escucharEstado(callback: (user: User | null) => void) {
        return onAuthStateChanged(this.auth, callback);
    }
}
