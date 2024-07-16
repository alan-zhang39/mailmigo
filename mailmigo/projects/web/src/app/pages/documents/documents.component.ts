import { Component, Signal, computed, signal } from "@angular/core";
import { DocumentsService } from "../../services/documents.service";
import { Document } from "@shared/types/document";
import { Option } from "@shared/types/rust/option";
import { DatabaseService } from "@services/database.service";
import { AuthService } from "@services/auth.service";
import { NgFor } from "@angular/common";
import { Router } from "@angular/router";
import { FilePreviewService } from "@services/file-preview.service";

@Component({
  selector: "app-document",
  standalone: true,
  imports: [NgFor],
  templateUrl: "./documents.component.html",
  styles: ``,
})
export class DocumentsComponent {
  documents: Signal<Document[]>;
  /*
  id: string;
  uid: string;
  orgId: string;
  createdOn: number;
  */

  constructor(
    auth: AuthService,
    db: DatabaseService,
    private router: Router,
    private preview: FilePreviewService,
  ) {
    const docObj = auth.user()
      ? db.observeWithInitial<{ [key: string]: Document }>(
          `documents/all/${auth.user()!.uid}`,
          {},
        )
      : signal({});
    this.documents = computed(() => Object.values(docObj()));
    // this.documents = documentsService.getDocumentContents();
  }

  public previewDocument(doc: Document) {
    this.preview.setFile(`documents/${doc.orgId}/${doc.uid}/${doc.id}.pdf`);
    this.router.navigate(["/preview"]);
  }
}
