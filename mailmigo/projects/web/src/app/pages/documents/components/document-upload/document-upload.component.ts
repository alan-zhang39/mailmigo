import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DocumentsService } from "@services/documents.service";
import { Buffer } from "buffer";

@Component({
  selector: "app-document-upload",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./document-upload.component.html",
  styles: ``,
})
export class DocumentUploadComponent {
  document: File | null = null;
  submitted = false;

  constructor(private documentsService: DocumentsService) {}

  /* Store the new file in `this.document`. */
  handleFileChange(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files === null || files.length != 1) {
      console.log("Expected one document, received " + files + " instead\n");
      return;
    }

    const file = files.item(0);
    if (file === null) {
      console.log("File is null.\n");
      return;
    }

    this.document = file;
  }

  // Upload the document to storage, and also create a transcription task.
  async onSubmit() {
    if (!this.document) {
      console.log("Cannot submit null document.\n");
      return;
    }

    this.submitted = true;
    console.log("Uploading and creating task\n");

    const arrayBuffer = await this.document.arrayBuffer();

    this.documentsService.uploadDocumentAndCreateTask(
      this.document.name,
      Buffer.from(arrayBuffer),
    );
  }
}
