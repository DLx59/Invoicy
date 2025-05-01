import {Component, inject, signal, WritableSignal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Menu} from 'primeng/menu';
import {Toast} from 'primeng/toast';
import {ClientInputStateModel, defaultClientInputState} from '../../models/input-state.model';
import {InvoiceFormGroupService} from '../../services/incoice-form-group/invoice-form-group.service';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'app-client-information',
  imports: [
    ReactiveFormsModule,
    Button,
    FloatLabel,
    InputText,
    Menu,
    Toast
  ],
  templateUrl: './client-information.component.html',
  styleUrl: './client-information.component.scss'
})
export class ClientInformationComponent {
  public readonly clientInputState: WritableSignal<ClientInputStateModel> = signal(defaultClientInputState);
  private readonly invoiceFormGroupService = inject(InvoiceFormGroupService);
  public formGroup = this.invoiceFormGroupService.getFormGroup();
  public clientOptions: MenuItem[] = [
    {
      label: 'Numéro d\'entreprise',
      icon: 'pi pi-building',
      command: () => this.addCLientIdInput()
    },
    {
      label: 'Numéro de TVA',
      icon: 'pi pi-building',
      command: () => this.addClientVATInput()
    },
  ];

  public addClientVATInput() {
    this.clientInputState.update((clientInputStateModel: ClientInputStateModel) => ({
      ...clientInputStateModel,
      vat: true
    }))
  }

  public addCLientIdInput() {
    this.clientInputState.update((clientInputStateModel: ClientInputStateModel) => ({
      ...clientInputStateModel,
      id: true
    }))
  }
}
