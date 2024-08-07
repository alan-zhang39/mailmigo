import { AsyncPipe } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { SafePipe } from "@utils/safe.pipe";

@Component({
  selector: "app-file-frame",
  standalone: true,
  imports: [SafePipe, AsyncPipe],
  templateUrl: "./file-frame.component.html",
  styles: ``,
})
export class FileFrameComponent implements OnChanges {
  @Input({ required: true }) data!: Blob;
  public url: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl("");
  }

  ngOnChanges(changes: SimpleChanges) {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      changes["data"] ? URL.createObjectURL(changes["data"].currentValue) : "",
    );
  }
}
