import {Routes} from '@angular/router';
import {InvoiceFormComponent} from './features/invoice/components/invoice-form/invoice-form.component';
import {InvoiceListingComponent} from "./features/invoice/components/invoice-listing/invoice-listing.component";

export const routes: Routes = [
  {
    path: '',
    component: InvoiceListingComponent
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
