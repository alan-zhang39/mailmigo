import { Component, Signal, computed, signal } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { DocumentUploadComponent } from "./components/document-upload/document-upload.component";
import { DocumentsService } from "../../services/documents.service";
import { Document } from "@shared/types/document";
import { DatabaseService } from "@services/database.service";
import { AuthService } from "@services/auth.service";
import { NgFor } from "@angular/common";
import { Router } from "@angular/router";
import { FilePreviewService } from "@services/file-preview.service";

@Component({
  selector: "app-document",
  standalone: true,
  imports: [NgFor, DocumentUploadComponent, LucideAngularModule],
  templateUrl: "./documents.component.html",
  styles: ``,
})
export class DocumentsComponent {
  documents: Signal<Document[]>;
  documentsService: DocumentsService;
  /*
  id: string;
  uid: string;
  orgId: string;
  createdOn: number;
  */

  constructor(
    auth: AuthService,
    db: DatabaseService,
    documentsService: DocumentsService,
    private router: Router,
    private preview: FilePreviewService,
  ) {
    // I'm casting this because it's possible for this.documents to be null (yes, TS isn't saying it).
    // This happens when the uid, and consequently the path, doesn't exist in the RTDB.
    const docObj: Signal<{ [key: string]: Document } | null> = true
      ? db.observeWithInitial<{ [key: string]: Document }>(
          `documents/all/temp-user`,
          {},
        )
      : signal({});

    this.documents = computed(() => {
      const currentDocObj = docObj();
      return currentDocObj ? Object.values(currentDocObj) : [];
    });
    this.documentsService = documentsService;

    console.log("DocObj", Object.values(docObj() as Object));
  }

  public previewDocument(doc: Document) {
    this.preview.setFile(`documents/${doc.orgId}/${doc.uid}/${doc.id}.pdf`);
    this.router.navigate(["/preview"]);
  }
}
