import {
  Component,
  OnDestroy,
  Signal,
  WritableSignal,
  computed,
  signal,
} from "@angular/core";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FilterDialogComponent } from "../generations/components/filter-dialog/filter-dialog.component";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { RippleModule } from "primeng/ripple";
import { TableModule } from "primeng/table";
import { Document, Generation } from "../../../../../shared/index";
import { AuthService } from "@services/auth.service";
import { DatabaseService } from "@services/database.service";
import { Task } from "../../../../../shared/index";
import { FileService } from "@services/file.service";
import { Router } from "@angular/router";
import { StatusPillComponent } from "../generations/components/status-pill/status-pill.component";
import { PaginatorModule } from "primeng/paginator";
import { GenerationTypePillComponent } from "../generations/components/generation-type-pill/generation-type-pill.component";
import { DocumentsService } from "@services/documents.service";

@Component({
  selector: "app-home",
  standalone: true,
  providers: [DialogService, NgFor, NgIf],
  templateUrl: "./home.component.html",
  styles: ``,
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
export class HomeComponent {
  ref: DynamicDialogRef | undefined;
  genObj: Signal<{ [key: string]: Generation }>;
  tasksIds: Signal<string[]>;
  genRecords: Signal<Task[]>;
  paginatedGenRecords: Signal<Task[]>;
  totalGenRecords: Signal<number>;
  documents: Signal<Document[]>;
  paginatedDocRecords: Signal<Document[]>;
  totalDocRecords: Signal<number>;

  constructor(
    auth: AuthService,
    db: DatabaseService,
    public dialogService: DialogService,
    private documentsService: DocumentsService,
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

    this.totalDocRecords = computed(() => this.documents().length);
    this.paginatedDocRecords = computed(() => this.getPaginatedDocRecords());

    const tasks = db.observe<{ [key: string]: Task }>(`tasks`);
    this.genRecords = computed(() =>
      auth.user() && tasks().isSome()
        ? Object.values(tasks().unwrap() ?? {}).filter(
            (task) => task.uid == auth.user()!.uid,
          )
        : [],
    );

    this.totalGenRecords = computed(() => this.genRecords().length);
    this.paginatedGenRecords = computed(() => this.getPaginatedGenRecords());
  }

  getPaginatedDocRecords(): Document[] {
    const orderedRecords = this.documents().sort(
      (a, b) => b.timestamp - a.timestamp,
    );
    return orderedRecords.slice(0, 3);
  }

  getPaginatedGenRecords(): Task[] {
    const orderedRecords = this.genRecords().sort(
      (a, b) => b.timestamp - a.timestamp,
    );
    return orderedRecords.slice(0, 3);
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

  public chatWithDocument(doc: Document) {
    this.router.navigate(["/user/chat", `${doc.id}`]);
  }

  public previewDocument(doc: Document) {
    this.preview.setFile(`documents/${doc.orgId}/${doc.uid}/${doc.id}.pdf`);
    this.router.navigate(["/user/preview"]);
  }
}
