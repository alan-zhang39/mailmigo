import { Component } from "@angular/core";
import { ConfirmPopupModule } from "primeng/confirmpopup";
import { ConfirmationService, MessageService } from "primeng/api";
import { AuthService } from "@services/auth.service";

@Component({
  selector: "app-reset-password-dialog",
  standalone: true,
  imports: [ConfirmPopupModule],
  templateUrl: "./reset-password-dialog.component.html",
  providers: [ConfirmationService],
  styles: ``,
})
export class ResetPasswordDialogComponent {
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private authService: AuthService,
  ) {}

  confirm(event: Event, newPass: string, confirmPass: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: "Are you sure you want to proceed?",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        if (newPass != confirmPass) {
          this.messageService.add({
            severity: "error",
            summary: "Passwords don't match",
            life: 3000,
          });
          return;
        }
        const ret = await this.authService.changeCurrentUserPass(newPass);
        // if (ret != null && ret.code > 0) {
        //   this.messageService.add({
        //     severity: "error",
        //     summary: ret?.message,
        //     life: 3000,
        //   });
        // } else {
        //   this.messageService.add({
        //     severity: "success",
        //     summary: ret?.message,
        //     life: 3000,
        //   });
        // }
      },
    });
  }
}
