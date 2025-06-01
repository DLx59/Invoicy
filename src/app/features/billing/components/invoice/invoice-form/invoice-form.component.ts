import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {AutoCompleteCompleteEvent, AutoCompleteModule} from "primeng/autocomplete";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ClientInfo, InvoiceItem} from "../../../../invoice/models/invoice.model";
import {InvoiceDataService} from "../../../services/invoice-data/invoice-data.service";
import {Checkbox} from "primeng/checkbox";
import {InputNumber, InputNumberModule} from "primeng/inputnumber";
import {FloatLabel} from "primeng/floatlabel";

@Component({
  selector: 'app-invoice-form',
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    Checkbox,
    InputNumberModule,
    FloatLabel
  ],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.scss'
})
export class InvoiceFormComponent {
  public clientInfos: WritableSignal<Array<ClientInfo>> = signal([]);
  public selectedClientInfo: WritableSignal<ClientInfo | undefined> = signal(undefined);
  public isIntracommunity: WritableSignal<boolean> = signal(false);
  public formGroup: FormGroup = new FormGroup({
    clientInfo: new FormControl<ClientInfo>({
      id: '',
      name: '',
      address: {
        city: '',
        country: '',
        street: '',
        zipCode: ''
      },
      vat: '',
      reference: '',
    }),
    isIntracommunity: new FormControl(false),
    products: new FormControl<Array<InvoiceItem>>([]),
  });
  private invoiceDataService: InvoiceDataService = inject(InvoiceDataService);

  constructor() {
    effect(() => {
      this.invoiceDataService.loadClients().then((clients: Array<ClientInfo>) => {
        this.clientInfos.set(clients);
        console.warn(clients)
      });
    });

    this.formGroup.get('clientInfo')?.valueChanges.subscribe((clientInfo: ClientInfo) => this.selectedClientInfo.set(clientInfo))
    this.formGroup.get('isIntracommunity')?.valueChanges.subscribe((value: boolean) => this.isIntracommunity.set(value))
  }

  search(event: AutoCompleteCompleteEvent) {
    this.invoiceDataService.loadClients(event.query).then((clients: Array<ClientInfo>) => this.clientInfos.set(clients));
    console.warn(this.clientInfos())
  }
}
