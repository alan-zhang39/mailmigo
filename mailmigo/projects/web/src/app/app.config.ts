import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

import { routes } from "./app.routes";
import environment from "@environments/environment";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  LucideAngularModule,
  CirclePlus,
  SquareArrowOutUpRight,
  CircleMinus,
} from "lucide-angular";
import { MessageService } from "primeng/api";

// Firebase
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getDatabase, provideDatabase } from "@angular/fire/database";
import { provideStorage, getStorage } from "@angular/fire/storage";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideFunctions, getFunctions } from "@angular/fire/functions";
import { AuthGuard } from "@guards/auth.guard";

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFunctions(() => getFunctions()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    MessageService,
    AuthGuard,
    importProvidersFrom(
      LucideAngularModule.pick({
        CirclePlus,
        SquareArrowOutUpRight,
        CircleMinus,
      }),
    ),
    // importProvidersFrom(
    // ToastModule.forRoot({
    //   timeOut: 3000,
    //   positionClass: "toast-top-right",
    //   preventDuplicates: true,
    // }),
    // ),
  ],
};
