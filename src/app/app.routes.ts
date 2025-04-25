import {provideRouter, Routes, withComponentInputBinding, withViewTransitions} from '@angular/router';
import {InvoiceFormComponent} from './components/invoice-form/invoice-form.component';
import {HomeComponent} from './components/home/home.component';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'invoice',
    component: InvoiceFormComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
