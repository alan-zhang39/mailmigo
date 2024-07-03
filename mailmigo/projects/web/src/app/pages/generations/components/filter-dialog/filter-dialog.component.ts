import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Component } from '@angular/core';
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { ButtonModule } from "primeng/button";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";

@Component({
  selector: "generations-filter-dialog",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
  ],
  templateUrl: "./filter-dialog.component.html",
  styles: ``,
})
export class FilterDialogComponent {
  selectedType: string = "";
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
    this.ref.close({ type: this.selectedType, dateRange: this.dateRange });
  }
}
