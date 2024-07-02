import { Component } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MenuComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styles: ``
})
export class LayoutComponent {

}
