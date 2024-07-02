import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { LogoComponent } from '@components/logo/logo.component';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [LogoComponent, MenuModule, NgIf],
  templateUrl: './menu.component.html',
  styles: ``
})
export class MenuComponent implements OnInit{
  items: MenuItem[] | undefined;
  ngOnInit(){
    this.items = 
    [{ label: 'Information', items: [
      { label: 'Dashboard', icon: 'pi pi-home', route:'/' },
      { label: 'Account', icon: 'pi pi-user', route:'/account' },
      { label: 'Organization', icon: 'pi pi-users' }]
    },
    { label: 'Your Data', items:
      [{ label: 'Prompts', icon: 'pi pi-comment' },
      { label: 'Documents', icon: 'pi pi-file-pdf' },
      { label: 'Generations', icon: 'pi pi-pen-to-square' }]
    }
    ]
  }

}
