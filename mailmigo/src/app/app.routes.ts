import { Routes } from '@angular/router';

// Components
import { HomeComponent } from './pages/home/home.component';
import { CounterComponent } from './pages/counter/counter.component';

export const routes: Routes = [
  { path: 'count', component: CounterComponent },
  { path: '**', component: HomeComponent }, // Wildcard path must come last
];
