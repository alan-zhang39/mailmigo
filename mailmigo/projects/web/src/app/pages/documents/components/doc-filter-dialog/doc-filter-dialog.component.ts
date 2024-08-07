import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component } from "@angular/core";
import { CalendarModule } from "primeng/calendar";
import { ButtonModule } from "primeng/button";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";

@Component({
  selector: "documents-filter-dialog",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    ButtonModule,
  ],
  templateUrl: "./doc-filter-dialog.component.html",
  styles: ``,
})
export class DocumentsFilterDialogComponent {
  dateRange: Date[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  applyFilter() {
    const filters = {
      dateRange: this.dateRange,
    };
    this.ref.close(filters);
  }
}
