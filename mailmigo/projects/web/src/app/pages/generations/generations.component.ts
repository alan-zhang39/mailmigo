import { Component, OnDestroy, Signal, computed, signal } from "@angular/core";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FilterDialogComponent } from "./components/filter-dialog/filter-dialog.component";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { RippleModule } from "primeng/ripple";
import { TableModule } from "primeng/table";
import { Generation, Option } from "../../../../../shared/index";
import { AuthService } from "@services/auth.service";
import { DatabaseService } from "@services/database.service";
import { Task } from "../../../../../shared/index";
import { FilePreviewService } from "@services/file-preview.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-generations",
  templateUrl: "./generations.component.html",
  providers: [DialogService, NgFor, NgIf],
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, RippleModule, TableModule],
})
export class GenerationsComponent implements OnDestroy {
  ref: DynamicDialogRef | undefined;
  genObj: Signal<{ [key: string]: Generation }>;
  tasksIds: Signal<string[]>;
  records: Signal<Task[]>;

  constructor(
    auth: AuthService,
    db: DatabaseService,
    public dialogService: DialogService,
    private messageService: MessageService,
    private preview: FilePreviewService,
    private router: Router,
  ) {
    const genObj = auth.user()
      ? db.observeWithInitial<{ [key: string]: Generation }>(
          `generations/summary/all/${auth.user()!.uid}`,
          {},
        )
      : signal({});
    this.genObj = genObj;
    console.log(genObj());
    const taskIds = computed(() =>
      Object.values(genObj() ?? {}).map((value: any) => value.taskId),
    );
    this.tasksIds = taskIds;
    const tasks = db.observe<{ [key: string]: Task }>(`tasks`);
    this.records = computed(() =>
      auth.user() && tasks().isSome()
        ? Object.values(tasks().unwrap() ?? {}).filter(
            (task) => task.uid == auth.user()!.uid,
          )
        : [],
    );
  }

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

  download(record: any) {
    console.log(`Downloading ${record.title}`);
  }

  open(record: Task) {
    this.preview.setFile(
      `generations/summary/${record.orgId}/${record.uid}/${record.documentId}.pdf`,
    );
    this.router.navigate(["/preview"]);
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }

  pr(a: Object) {
    return JSON.stringify(a);
  }
}
