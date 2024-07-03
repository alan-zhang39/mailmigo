import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [MenuComponent, RouterOutlet, CommonModule],
  templateUrl: "./layout.component.html",
  styles: ``,
})
export class LayoutComponent implements OnInit {
  headerTitle: string = "";

  routeTitles: { [key: string]: string } = {
    "": "Dashboard",
    account: "Account",
    organization: "Organization",
    prompts: "Prompts",
    documents: "Documents",
    generations: "Generations",
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeaderTitle();
      });

    this.updateHeaderTitle();
  }

  updateHeaderTitle() {
    const child = this.activatedRoute.firstChild?.snapshot;
    if (child && child.url.length) {
      const routePath = child.url[0].path;
      this.headerTitle = this.routeTitles[routePath] || "";
    } else {
      this.headerTitle = this.routeTitles[""] || "";
    }
  }
}
