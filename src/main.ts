
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import {
  gridOutline,
  listOutline,
  bookmarkOutline,
  addCircleOutline,
  arrowBackOutline,
  locationOutline,
  cameraOutline,
  checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { addIcons } from 'ionicons';
addIcons({
  'grid-outline': gridOutline,
  'list-outline': listOutline,
  'bookmark-outline': bookmarkOutline,
  'add-circle-outline': addCircleOutline,
  'arrow-back-outline': arrowBackOutline,
  'location-outline': locationOutline,
  'camera-outline': cameraOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'alert-circle-outline': alertCircleOutline
});


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding()
    ),
    provideHttpClient(),
  ],
});
