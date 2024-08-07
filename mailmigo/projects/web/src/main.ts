import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";

// Delete this comment to trigger CI/CD

bootstrapApplication(AppComponent, appConfig).catch((e) => console.log(e));
