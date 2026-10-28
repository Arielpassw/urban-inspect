# UrbanInspect

Aplicación móvil para registrar incidencias urbanas, consultar su detalle y dar seguimiento a su estado.

## Quick Start

Requisitos: Node.js LTS y npm.

```bash
npm ci
npm start
```

Abre la URL que muestra Angular en la terminal (por defecto, `http://localhost:4200`).

Para validar una compilación:

```bash
npm run build
```

Para Android, con Android Studio instalado:

```bash
npx cap sync android
npx cap open android
```

## Tecnologías y dependencias

- Angular 22, TypeScript, Angular Router y Forms
- Ionic Angular 9 e Ionicons para la interfaz móvil
- Capacitor 8 para integrar capacidades nativas como cámara y geolocalización
- RxJS para operaciones asíncronas
- Servicios externos: MockAPI (incidencias), Open-Meteo (clima) y Cloudinary (imágenes)

## Decisiones técnicas

Ionic y Angular permiten reutilizar componentes y mantener las pantallas organizadas; Capacitor permite usar capacidades móviles desde la misma aplicación web. La lógica de incidencias y servicios externos se separa en servicios para facilitar mantenimiento y pruebas.

## Seguridad

No agregues contraseñas, tokens ni credenciales privadas al repositorio. Los archivos `.env` y las configuraciones locales `src/environments/environment.local.ts` están ignorados por Git. La configuración actual de Angular se encuentra en `src/environments/environment.ts` y `environment.prod.ts`; cualquier valor allí queda incluido en el cliente compilado, por lo que solo deben contener configuración pública, nunca secretos. Si una clave privada ya fue publicada, revócala y rótala: `.gitignore` no la elimina del historial de Git.
