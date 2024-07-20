import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'generation-type-pill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generation-type-pill.component.html',
  styles: ``
})
export class GenerationTypePillComponent {
  @Input() type!: string;

  typeClassMap: Record<string, string> = {
    "summary": "bg-blue-100 text-blue-700",
    "case_study": "bg-purple-100 text-purple-700",
  };

  iconClassMap: Record<string, string> = {
    "summary": "pi pi-book",
    "case_study": "pi pi-briefcase",
  };

  transformType(value: string): string {
    return value
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }
}