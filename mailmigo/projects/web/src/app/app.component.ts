import { RouterOutlet } from "@angular/router";
import { Component } from "@angular/core";
import { ToastModule } from "primeng/toast";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "mailmigo";
}
