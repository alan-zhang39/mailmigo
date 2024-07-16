import { Component } from "@angular/core";
import { ButtonComponent } from "../../components/button/button.component";
import { GreetingComponent } from "./components/greeting/greeting.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [ButtonComponent, GreetingComponent],
  templateUrl: "./home.component.html",
  styles: ``,
})
export class HomeComponent {
  constructor() {}
}
