import {Routes} from '@angular/router';
import {InvoiceFormComponent} from './features/invoice/components/invoice-form/invoice-form.component';
import {HomeComponent} from './pages/home/home.component';

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
