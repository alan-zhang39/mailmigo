import { Routes } from "@angular/router";

// Components
import { HomeComponent } from "./pages/home/home.component";
import { CounterComponent } from "./pages/counter/counter.component";
import { LayoutComponent } from "./pages/layout/layout.component";
import { DocumentsComponent } from "./pages/documents/documents.component";
import { GenerationsComponent } from "./pages/generations/generations.component";
import { AccountComponent } from "./pages/account/account.component";
import { SignInComponent } from "./pages/sign-in/sign-in.component";
import { SignUpComponent } from "./pages/sign-up/sign-up.component";
import { FilePreviewComponent } from "./pages/file-preview/file-preview.component";
import { ConfigurationsComponent } from "./pages/configurations/configurations.component";
import { DocumentChatComponent } from './pages/document-chat/document-chat.component'

export const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "count", component: CounterComponent },
      { path: "documents", component: DocumentsComponent },
      { path: "account", component: AccountComponent },
      { path: "generations", component: GenerationsComponent },
      { path: "configurations", component: ConfigurationsComponent },
      { path: "preview", component: FilePreviewComponent },
  { path: 'chat', component: DocumentChatComponent },
    ],
  },
  { path: "sign-up", component: SignUpComponent },
  { path: "sign-in", component: SignInComponent },
  { path: "**", component: HomeComponent }, // Wildcard path must come last
];