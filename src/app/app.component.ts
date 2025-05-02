import {Component, inject} from '@angular/core';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Router, RouterLink, RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [
        Button,
        TableModule,
        RouterOutlet,
        RouterLink
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    private router: Router = inject(Router);

    public createInvoice() {
        this.router.navigate(['invoice']);
    }
}
