import { Injectable, Signal } from "@angular/core";
import { DatabaseService } from "./database.service";
import { Document } from "@shared/types/document";
import { Option } from "@shared/types/rust/option";

@Injectable({
  providedIn: "root",
})
export class DocumentsService {
  documents: Signal<Option<Object>>; // the Object is { [documentId: string] : Document }

  constructor(private db: DatabaseService) {
    // Please see custom-documents.json from Discord.
    // The content in the actual database does not follow the Document interface,
    // so I imported this file to test.

    this.documents = db.observe<Object>("");
  }

  getDocumentContents = (): Document[] => {
    const currentDocuments = this.documents();
    // These are placeholders just to confirm that I'm actually able to use the DB service.
    // This function is supposed to somehow get the relevant content of the documents instead of just the ID.
    if (currentDocuments.isNone()) {
      // should return [], but I wanted to see some output
      return [
        {
          id: "no documents",
          uid: "0",
          orgId: "0",
          timestamp: 123,
          filename: "sample.pdf",
        },
      ];
    }

    /* That means if the array is actually empty, the function ran this part of the code (but there was no data).
     */
    return currentDocuments.isSome()
      ? Object.values(currentDocuments.unwrap())
      : [];
  };

  // Delete the RTDB entry in the path demo/documents/id.
  // TODO: also delete from firestore
  deleteDocument = (id: string) => {
    console.log("deleteDocument called with id:", id);
    // this.db.remove(`${documentsPath}/${id}`);
  };
}
