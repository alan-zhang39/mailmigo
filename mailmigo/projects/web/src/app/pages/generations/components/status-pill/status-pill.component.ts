import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "generations-status-pill",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./status-pill.component.html",
  styles: ``,
})
export class StatusPillComponent {
  @Input() status!:
    | "complete"
    | "failed"
    | "uploading"
    | "transcribing"
    | "generating";

  statusClassMap = {
    complete: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    uploading: "bg-yellow-100 text-yellow-700",
    transcribing: "bg-yellow-100 text-yellow-700",
    generating: "bg-yellow-100 text-yellow-700",
  };

  iconClassMap = {
    complete: "pi pi-check-circle",
    failed: "pi pi-times-circle",
    uploading: "pi pi-spinner pi-spin",
    transcribing: "pi pi-cog pi-spin",
    generating: "pi pi-cog pi-spin",
  };
}
