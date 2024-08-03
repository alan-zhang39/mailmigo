import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ButtonModule, MenubarModule, RouterModule],
  templateUrl: './landing.component.html',
  styles: ``
})
export class LandingComponent {

}
