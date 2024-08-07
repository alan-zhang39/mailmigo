import { Routes } from "@angular/router";

// Components
import { HomeComponent } from "./pages/home/home.component";
import { CounterComponent } from "./pages/counter/counter.component";
import { LayoutComponent } from "./pages/layout/layout.component";
import { DocumentsComponent } from "./pages/documents/documents.component";
import { GenerationsComponent } from "./pages/generations/generations.component";
import { AccountComponent } from "./pages/account/account.component";
import { OrganizationComponent } from "./pages/organization/organization.component";
import { JoinComponent } from "./pages/join/join.component";
import { SignInComponent } from "./pages/sign-in/sign-in.component";
import { SignUpComponent } from "./pages/sign-up/sign-up.component";
import { FilePreviewComponent } from "./pages/file-preview/file-preview.component";
import { ConfigurationsComponent } from "./pages/configurations/configurations.component";
import { DocumentChatComponent } from "./pages/document-chat/document-chat.component";
import { LandingComponent } from "./pages/landing/landing.component";

// Guards
import { AuthGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {path: "", component: LandingComponent},
  {
    path: "user",
    component: LayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: "dashboard", component: HomeComponent },
      { path: "count", component: CounterComponent },
      { path: "documents", component: DocumentsComponent },
      { path: "account", component: AccountComponent },
      { path: "organization", component: OrganizationComponent },
      { path: "join/:id", component: JoinComponent },
      { path: "generations", component: GenerationsComponent },
      { path: "configurations", component: ConfigurationsComponent },
      {
        path: "preview",
        component: FilePreviewComponent,
      },
      { path: "chat/:id", component: DocumentChatComponent },
      // { path: "**", component: HomeComponent }, // Wildcard path must come last
    ],
  },
  { path: "sign-up", component: SignUpComponent },
  { path: "sign-in", component: SignInComponent },
  { path: "**", component: SignUpComponent }, // Wildcard path must come last
];
