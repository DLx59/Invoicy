import {Component, inject, input, InputSignal, Signal, signal, WritableSignal} from '@angular/core';
import {Button} from "primeng/button";
import {FloatLabel} from "primeng/floatlabel";
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputText} from "primeng/inputtext";
import {Menu} from "primeng/menu";
import {Textarea} from "primeng/textarea";
import {defaultIssuerInputState, IssuerInputStateModel} from '../../models/input-state.model';
import {MenuItem} from 'primeng/api';
import {InvoiceFormGroupService} from '../../services/incoice-form-group/invoice-form-group.service';

@Component({
  selector: 'app-issuer-information',
  imports: [
    Button,
    FloatLabel,
    FormsModule,
    InputText,
    Menu,
    ReactiveFormsModule
  ],
  templateUrl: './issuer-information.component.html',
  styleUrl: './issuer-information.component.scss'
})
export class IssuerInformationComponent {
  private readonly invoiceFormGroupService = inject(InvoiceFormGroupService);
  public formGroup = this.invoiceFormGroupService.getFormGroup();
  public readonly issuerInputState: WritableSignal<IssuerInputStateModel> = signal(defaultIssuerInputState);
  public issuerOptions: MenuItem[] = [
    {
      label: 'Téléphone',
      icon: 'pi pi-phone',
      command: () => this.addIssuerPhoneInput()
    },
    {
      label: 'Site web',
      icon: 'pi pi-globe',
      command: () => this.addIssuerWebsiteInput()
    },
    {
      label: 'Email',
      icon: 'pi pi-envelope',
      command: () => this.addIssuerEmailInput()
    },
  ];

  public addIssuerPhoneInput() {
    this.issuerInputState.update((issuerInputStateModel: IssuerInputStateModel) => ({
      ...issuerInputStateModel,
      phone: true
    }))
  }

  public addIssuerWebsiteInput() {
    this.issuerInputState.update((issuerInputStateModel: IssuerInputStateModel) => ({
      ...issuerInputStateModel,
      website: true
    }))
  }

  public addIssuerEmailInput() {
    this.issuerInputState.update((issuerInputStateModel: IssuerInputStateModel) => ({
      ...issuerInputStateModel,
      email: true
    }))
  }
}
