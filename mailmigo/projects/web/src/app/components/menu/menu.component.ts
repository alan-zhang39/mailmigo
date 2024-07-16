import { Component, OnInit } from "@angular/core";
import { NgIf } from "@angular/common";
import { LogoComponent } from "../logo/logo.component";
import { MenuItem } from "primeng/api";
import { MenuModule } from "primeng/menu";

@Component({
  selector: "app-menu",
  standalone: true,
  imports: [LogoComponent, MenuModule, NgIf],
  templateUrl: "./menu.component.html",
  styles: ``,
})
export class MenuComponent implements OnInit {
  items: MenuItem[] | undefined;
  ngOnInit() {
    this.items = [
      {
        label: "Information",
        items: [
          { label: "Dashboard", icon: "pi pi-home", route: "/" },
          { label: "Account", icon: "pi pi-user", route: "/account" },
          { label: "Organization", icon: "pi pi-users" },
        ],
      },
      {
        label: "Your Data",
        items: [
          {
            label: "Configurations",
            icon: "pi pi-cog",
            route: "/configurations",
          },
          { label: "Documents", icon: "pi pi-file-pdf", route: "/documents" },
          {
            label: "Generations",
            icon: "pi pi-pen-to-square",
            route: "/generations",
          },
        ],
      },
    ];
  }
}
