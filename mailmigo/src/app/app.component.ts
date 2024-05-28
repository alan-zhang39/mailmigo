import { RouterOutlet } from '@angular/router';
import { Component, inject } from '@angular/core';
import { Database } from '@angular/fire/database';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'mailmigo';
}
