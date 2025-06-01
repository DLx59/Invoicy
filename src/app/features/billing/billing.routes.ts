import {Routes} from "@angular/router";
import {InvoiceComponent} from "./components/invoice/invoice.component";
import {InvoiceFormComponent} from "./components/invoice/invoice-form/invoice-form.component";

export const billingRoutes: Routes = [
  {
    path: '',
    component: InvoiceComponent
  },
  {
    path: 'new',
    component: InvoiceFormComponent
  }
]

