import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component } from "@angular/core";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { ButtonModule } from "primeng/button";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";
import { MultiSelectModule } from "primeng/multiselect";
import { CheckboxModule } from "primeng/checkbox";

@Component({
  selector: "generations-filter-dialog",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    MultiSelectModule,
    CheckboxModule,
  ],
  templateUrl: "./filter-dialog.component.html",
  styles: ``,
})
export class FilterDialogComponent {
  filterByType: boolean = false;
  filterByDate: boolean = false;
  selectedTypes: string[] = [];
  dateRange: Date[] = [];
  generationTypes: { label: string; value: string }[] = [
    { label: "Summary", value: "Summary" },
    { label: "Case Study", value: "Case Study" },
  ];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  applyFilter() {
    const filters = {
      type: this.filterByType ? this.selectedTypes : null,
      dateRange: this.filterByDate ? this.dateRange : null,
    };
    this.ref.close(filters);
  }
}
