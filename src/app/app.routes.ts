import {Routes} from '@angular/router';
import {InvoiceListingComponent} from "./features/invoice/components/invoice-listing/invoice-listing.component";
import {HomeComponent} from "./pages/home/home.component";
import {InvoiceDraftComponent} from "./features/invoice/components/invoice-draft/invoice-draft.component";
import {InvoiceComponent} from "./features/billing/components/invoice/invoice.component";
import {billingRoutes} from "./features/billing/billing.routes";

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'quotations',
    children: [
      {
        path: 'invoice',
        component: InvoiceComponent
      }
    ]
  },
  {
    path: 'invoices',
    children: billingRoutes,
  },
  // {
  //   path: 'invoice',
  //   children: [
  //     {
  //       path: '',
  //       component: InvoiceFormComponent
  //     },
  //     {
  //       path: ':invoiceNumber',
  //       component: InvoiceFormComponent
  //     }
  //   ]
  // },
  {
    path: 'invoice-history',
    component: InvoiceListingComponent
  },
  {
    path: 'invoice-draft',
    component: InvoiceDraftComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
