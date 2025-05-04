import { Component } from '@angular/core';
import {Card} from "primeng/card";
import {Button} from "primeng/button";

@Component({
  selector: 'app-invoice',
  imports: [
    Card,
    Button
  ],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent {

}
