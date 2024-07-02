import { Routes } from '@angular/router';

// Components
import { HomeComponent } from './pages/home/home.component';
import { CounterComponent } from './pages/counter/counter.component';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';

export const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "count", component: CounterComponent }
    ],
  },
  { path: "login", component: LoginComponent },
  { path: "**", component: HomeComponent }, // Wildcard path must come last
];