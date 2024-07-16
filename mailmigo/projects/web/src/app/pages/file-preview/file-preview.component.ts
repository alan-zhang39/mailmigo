import { NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { FileFrameComponent } from "@components/file-frame/file-frame.component";
import { FilePreviewService } from "@services/file-preview.service";

@Component({
  selector: "app-file-preview",
  standalone: true,
  imports: [FileFrameComponent, NgIf],
  templateUrl: "./file-preview.component.html",
  styles: ``,
})
export class FilePreviewComponent {
  constructor(public fileService: FilePreviewService) {
    if (fileService.current.isSome())
      console.log(fileService.current.unwrap().path);
  }
}
