import { Component, OnDestroy } from "@angular/core";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FilterDialogComponent } from "./components/filter-dialog/filter-dialog.component";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { CommonModule } from "@angular/common";
import { RippleModule } from "primeng/ripple";

@Component({
  selector: "app-generations",
  templateUrl: "./generations.component.html",
  providers: [DialogService, MessageService],
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, RippleModule],
})
export class GenerationsComponent implements OnDestroy {
  ref: DynamicDialogRef | undefined;

  constructor(
    public dialogService: DialogService,
    private messageService: MessageService,
  ) {}

  showFilterDialog() {
    this.ref = this.dialogService.open(FilterDialogComponent, {
      header: "Filter",
      width: "25vw",
      height: "auto",
      baseZIndex: 10000,
      contentStyle: { overflow: "visible" },
    });

    this.ref.onClose.subscribe((filter) => {
      if (filter) {
        this.messageService.add({
          severity: "info",
          summary: "Filter Applied",
          detail: `Type: ${filter.type}, Date Range: ${filter.dateRange}`,
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
