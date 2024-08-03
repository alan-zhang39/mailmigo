import {
  Component,
  OnDestroy,
  Signal,
  WritableSignal,
  computed,
  signal,
} from "@angular/core";
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
import { FileService } from "@services/file.service";
import { Router } from "@angular/router";
import { StatusPillComponent } from "./components/status-pill/status-pill.component";
import { PaginatorModule } from "primeng/paginator";
import { GenerationTypePillComponent } from "./components/generation-type-pill/generation-type-pill.component";

@Component({
  selector: "app-generations",
  templateUrl: "./generations.component.html",
  providers: [DialogService, NgFor, NgIf],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    RippleModule,
    TableModule,
    StatusPillComponent,
    PaginatorModule,
    GenerationTypePillComponent,
  ],
})
export class GenerationsComponent implements OnDestroy {
  ref: DynamicDialogRef | undefined;
  genObj: Signal<{ [key: string]: Generation }>;
  tasksIds: Signal<string[]>;
  records: Signal<Task[]>;
  paginatedRecords: Signal<Task[]>;
  totalRecords: Signal<number>;
  searchTerm: WritableSignal<string>;
  rows: number = 8;
  currentPage: number = 0;
  selectedTypes: { label: string; value: string }[] = [];
  dateRange: Date[] = [];
  filtersApplied: boolean = false;

  constructor(
    auth: AuthService,
    db: DatabaseService,
    public dialogService: DialogService,
    private messageService: MessageService,
    private preview: FileService,
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

    this.totalRecords = computed(() => this.records().length);
    this.searchTerm = signal("");
    this.paginatedRecords = computed(() => this.getPaginatedRecords());
  }

  getPaginatedRecords(): Task[] {
    const filteredRecords = this.applyFilters(
      this.searchRecords(this.records()),
    );
    const orderedRecords = this.orderRecords(filteredRecords);
    const start = this.currentPage * this.rows;
    const end = start + this.rows;
    return orderedRecords.slice(start, end);
  }

  orderRecords(records: Task[]): Task[] {
    return records.sort((a, b) => b.timestamp - a.timestamp);
  }

  searchRecords(records: Task[]): Task[] {
    const searchTerm = this.searchTerm().toLowerCase();
    return records.filter((record) =>
      record.id.toLowerCase().includes(searchTerm),
    );
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.paginatedRecords = computed(() => this.getPaginatedRecords());
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.target.value);
    this.currentPage = 0; // Reset to first page on search
    this.paginatedRecords = computed(() => this.getPaginatedRecords());
  }

  applyFilters(records: Task[]): Task[] {
    let filteredRecords = records;

    if (this.selectedTypes.length) {
      const selectedTypeValues = this.selectedTypes.map((type) =>
        type.value.toLowerCase(),
      );
      filteredRecords = filteredRecords.filter((record) =>
        selectedTypeValues.includes(record.type.toLowerCase()),
      );
    }

    if (this.dateRange.length === 2) {
      const [start, end] = this.dateRange;
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);

      filteredRecords = filteredRecords.filter((record) => {
        const date = new Date(record.timestamp);
        return date >= start && date <= endOfDay;
      });
    }

    return filteredRecords;
  }

  resetFilters() {
    this.selectedTypes = [];
    this.dateRange = [];
    this.filtersApplied = false;
    this.currentPage = 0; // Reset to first page on filter reset
    this.paginatedRecords = computed(() => this.getPaginatedRecords());
    this.messageService.add({
      severity: "info",
      summary: "Filters Reset",
      detail: "All filters have been reset.",
    });
  }

  showFilterDialog() {
    this.ref = this.dialogService.open(FilterDialogComponent, {
      header: "Filter",
      width: "30vw",
      height: "auto",
      baseZIndex: 10000,
      contentStyle: { overflow: "visible" },
    });

    this.ref.onClose.subscribe((filters) => {
      if (filters) {
        this.selectedTypes = filters.type || [];
        this.dateRange = filters.dateRange || [];
        this.filtersApplied = true;
        this.currentPage = 0; // Reset to first page on filter
        this.paginatedRecords = computed(() => this.getPaginatedRecords());

        const selectedTypeLabels = this.selectedTypes
          .map((type) => type.label)
          .join(", ");

        this.messageService.add({
          severity: "info",
          summary: "Filter Applied",
          detail: `Type: ${selectedTypeLabels}, Date Range: ${this.dateRange}`,
        });
      }
    });
  }

  async download(record: any) {
    const path = `generations/summary/${record.orgId}/${record.uid}/${record.documentId}.pdf`;
    await this.preview.downloadFile(path);
  }

  open(record: Task) {
    this.preview.setFile(
      `generations/summary/${record.orgId}/${record.uid}/${record.documentId}.pdf`,
    );
    this.router.navigate(["/user/preview"]);
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
