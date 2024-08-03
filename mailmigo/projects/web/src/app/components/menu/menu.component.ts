import { Component, OnInit } from "@angular/core";
import { NgIf } from "@angular/common";
import { LogoComponent } from "../logo/logo.component";
import { MenuItem } from "primeng/api";
import { MenuModule } from "primeng/menu";
import { AuthService } from "@services/auth.service";

@Component({
  selector: "app-menu",
  standalone: true,
  imports: [LogoComponent, MenuModule, NgIf],
  templateUrl: "./menu.component.html",
  styles: ``,
})
export class MenuComponent implements OnInit {
  items: MenuItem[] | undefined;
  prepend = "/user";

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.items = [
      {
        label: "Information",
        items: [
          { label: "Dashboard", icon: "pi pi-home", route: `${this.prepend}/dashboard` },
          { label: "Account", icon: "pi pi-user", route: `${this.prepend}/account` },
          { label: "Organization", icon: "pi pi-users", route: `${this.prepend}/organization` },
        ],
      },
      {
        label: "Your Data",
        items: [
          { label: "Configurations", icon: "pi pi-cog", route: `${this.prepend}/configurations` },
          { label: "Documents", icon: "pi pi-file-pdf", route: `${this.prepend}/documents` },
          { label: "Generations", icon: "pi pi-pen-to-square", route: `${this.prepend}/generations` },
        ],
      },
      {
        label: "Manage",
        items: [
          {
            label: "Logout",
            icon: "pi pi-sign-out",
            command: () => this.auth.logout(),
          },
        ],
      },
    ];
  }
}
