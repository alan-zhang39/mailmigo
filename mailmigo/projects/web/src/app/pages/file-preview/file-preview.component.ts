import { NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { FileFrameComponent } from "@components/file-frame/file-frame.component";
import { FileService } from "@services/file.service";

@Component({
  selector: "app-file-preview",
  standalone: true,
  imports: [FileFrameComponent, NgIf],
  templateUrl: "./file-preview.component.html",
  styles: ``,
})
export class FilePreviewComponent {
  constructor(public fileService: FileService) {
    if (fileService.current.isSome())
      console.log(fileService.current.unwrap().path);
  }
}
