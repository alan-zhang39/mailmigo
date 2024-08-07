import {
  Component,
  Signal,
  WritableSignal,
  computed,
  signal,
} from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { DocumentsService } from "../../services/documents.service";
import { Document } from "@shared/types/document";
import { DatabaseService } from "@services/database.service";
import { AuthService } from "@services/auth.service";
import { CommonModule, NgFor } from "@angular/common";
import { Router } from "@angular/router";
import { FileService } from "@services/file.service";
import { FormsModule } from "@angular/forms";
import { FileUploadModule } from "primeng/fileupload";
import { Buffer } from "buffer";
import { PaginatorModule } from "primeng/paginator";
import { ToastModule } from "primeng/toast";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { MessageService } from "primeng/api";
import { DocumentsFilterDialogComponent } from "./components/doc-filter-dialog/doc-filter-dialog.component";

@Component({
  selector: "app-document",
  standalone: true,
  imports: [
    NgFor,
    LucideAngularModule,
    FormsModule,
    FileUploadModule,
    CommonModule,
    PaginatorModule,
    ButtonModule,
    ToastModule,
    TableModule,
  ],
  templateUrl: "./documents.component.html",
  styles: ``,
  providers: [DialogService],
})
export class DocumentsComponent {
  documents: Signal<Document[]>;
  paginatedRecords: Signal<Document[]>;
  totalRecords: Signal<number>;
  searchTerm: WritableSignal<string>;
  submitted = false;
  rows: number = 8; // Number of rows per page
  currentPage: number = 0;
  filtersApplied: boolean = false;
  dateRange: Date[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(
    auth: AuthService,
    db: DatabaseService,
    private documentsService: DocumentsService,
    private messageService: MessageService,
    private router: Router,
    private preview: FileService,
    public dialogService: DialogService,
  ) {
    const docObj: Signal<{ [key: string]: Document } | null> = true
      ? db.observeWithInitial<{ [key: string]: Document }>(
          `documents/all/${auth.user()!.uid}`,
          {},
        )
      : signal({});

    this.documents = computed(() => {
      const currentDocObj = docObj();
      return currentDocObj ? Object.values(currentDocObj) : [];
    });

    this.totalRecords = computed(() => this.documents().length);
    this.searchTerm = signal("");
    this.paginatedRecords = computed(() => this.getPaginatedRecords());
  }

  getPaginatedRecords(): Document[] {
    const filteredRecords = this.applyFilters(
      this.searchRecords(this.documents()),
    );
    const orderedRecords = this.orderRecords(filteredRecords);
    const start = this.currentPage * this.rows;
    const end = start + this.rows;
    return orderedRecords.slice(start, end);
  }

  orderRecords(records: Document[]): Document[] {
    return records.sort((a, b) => b.timestamp - a.timestamp);
  }

  searchRecords(records: Document[]): Document[] {
    const searchTerm = this.searchTerm().toLowerCase();
    return records.filter((record) =>
      record.filename.toLowerCase().includes(searchTerm),
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

  applyFilters(records: Document[]): Document[] {
    let filteredRecords = records;

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
    this.ref = this.dialogService.open(DocumentsFilterDialogComponent, {
      header: "Filter",
      width: "30vw",
      height: "auto",
      baseZIndex: 10000,
      contentStyle: { overflow: "visible" },
    });

    this.ref.onClose.subscribe((filters) => {
      if (filters) {
        this.dateRange = filters.dateRange || [];
        this.filtersApplied = true;
        this.currentPage = 0; // Reset to first page on filter
        this.paginatedRecords = computed(() => this.getPaginatedRecords());

        this.messageService.add({
          severity: "info",
          summary: "Filter Applied",
          detail: `Date Range: ${this.dateRange}`,
        });
      }
    });
  }

  async onUpload(event: any, fileInput: any) {
    const file = event.files[0];
    if (!file) {
      this.messageService.add({
        severity: "error",
        summary: "Upload Failed",
        detail: "No file selected.",
      });
      return;
    }

    this.submitted = true;
    console.log("Uploading and creating task\n");

    const arrayBuffer = await file.arrayBuffer();

    try {
      await this.documentsService.uploadDocumentAndCreateTask(
        file.name,
        Buffer.from(arrayBuffer),
      );
      this.messageService.add({
        severity: "success",
        summary: "Upload Successful",
        detail: "Document uploaded successfully.",
      });
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Upload Failed",
        detail: "Failed to upload document.",
      });
    } finally {
      this.submitted = false;
      // Clear the file input after upload
      fileInput.clear();
    }
  }

  public chatWithDocument(doc: Document) {
    this.router.navigate(["/user/chat", `${doc.id}`]);
  }

  public previewDocument(doc: Document) {
    this.preview.setFile(`documents/${doc.orgId}/${doc.uid}/${doc.id}.pdf`);
    this.router.navigate(["/user/preview"]);
  }

  public async deleteDocument(docId: string) {
    try {
      await this.documentsService.deleteDocument(docId);
      this.messageService.add({
        severity: "success",
        summary: "Delete Successful",
        detail: "Document deleted successfully.",
      });
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Delete Failed",
        detail: "Failed to delete document.",
      });
    }
  }
}
