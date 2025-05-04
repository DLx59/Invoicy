import {Component, computed, inject, signal} from '@angular/core';
import {Menu} from "primeng/menu";
import {Ripple} from "primeng/ripple";
import {Badge} from "primeng/badge";
import {MenuItem} from "primeng/api";
import {Button} from "primeng/button";
import {Select} from "primeng/select";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-menu',
  imports: [
    Menu,
    Ripple,
    Badge,
    Button,
    Select,
    FormsModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  public profiles = signal<any[]>([
    {id: '1', name: 'WTZ SRL', url: 'assets/img/wtz_logo_v1.png'},
  ]);

  public selectedProfils = computed(() => {
    const list = this.profiles();
    return list.length === 1 ? list[0] : undefined;
  });
  private router: Router = inject(Router);

  public items: MenuItem[] = [
    {
      separator: true
    },
    {
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          command: () => {
            this.router.navigate(['/']);
          }
        }
      ]
    },
    {
      label: 'Facturation',
      items: [
        {
          label: 'Devis',
          icon: 'pi pi-file',
          badge: '+',
          command: () => {
            this.router.navigate(['quotations']);
          }
        },
        {
          label: 'Factures',
          icon: 'pi pi-dollar',
          badge: '+',
          command: () => {
            this.router.navigate(['invoices']);
          }
        }
      ]
    },
    {
      label: 'Comptabilité',
      items: [
        {
          label: 'Factures d\'achat',
          icon: 'pi pi-shop',
          badge: '+'
        },
        {
          label: 'Notes de frais',
          icon: 'pi pi-clipboard',
          badge: '+'
        }
      ]
    },
    {
      label: 'CRM',
      items: [
        {
          label: 'Clients',
          icon: 'pi pi-address-book',
          badge: '+'
        },
        {
          label: 'Sociétés',
          icon: 'pi pi-building',
          badge: '+'
        }
      ]
    }
  ];
}
