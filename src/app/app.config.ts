import {ApplicationConfig, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding, withViewTransitions} from '@angular/router';
import {routes} from './app.routes';
import Aura from '@primeng/themes/aura';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {definePreset} from "@primeng/themes";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {providePrimeNG} from "primeng/config";

registerLocaleData(localeFr);

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    },
    info: {
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}'
    },
    success: {
      50: '{green.50}',
      100: '{green.100}',
      200: '{green.200}',
      300: '{green.300}',
      400: '{green.400}',
      500: '{green.500}',
      600: '{green.600}',
      700: '{green.700}',
      800: '{green.800}',
      900: '{green.900}',
      950: '{green.950}'
    },
    warning: {
      50: '{yellow.50}',
      100: '{yellow.100}',
      200: '{yellow.200}',
      300: '{yellow.300}',
      400: '{yellow.400}',
      500: '{yellow.500}',
      600: '{yellow.600}',
      700: '{yellow.700}',
      800: '{yellow.800}',
      900: '{yellow.900}',
      950: '{yellow.950}'
    },
    danger: {
      50: '{red.50}',
      100: '{red.100}',
      200: '{red.200}',
      300: '{red.300}',
      400: '{red.400}',
      500: '{red.500}',
      600: '{red.600}',
      700: '{red.700}',
      800: '{red.800}',
      900: '{red.900}',
      950: '{red.950}'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      inputVariant: 'filled',
      zIndex: {
        modal: 1100,
        overlay: 1000,
        menu: 1000,
        tooltip: 1100
      },
      theme: {
        preset: MyPreset,
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
        }
      }
    }),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes,
      withViewTransitions(),
      withComponentInputBinding()
    ),
  ]
};
