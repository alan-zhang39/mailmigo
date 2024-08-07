import { Component, OnInit, OnDestroy, Signal, signal } from "@angular/core";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { MessageService } from "primeng/api";
import { ResetPasswordDialogComponent } from "./components/reset-password-dialog/reset-password-dialog.component";
import { ToastModule } from "primeng/toast";
import { FormsModule } from "@angular/forms";
import { MenuComponent } from "@components/menu/menu.component";
import { AvatarModule } from "primeng/avatar";
import { DropdownModule } from "primeng/dropdown";
import { CheckboxModule } from "primeng/checkbox";
import { NgFor, NgIf } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { DatabaseService } from "../../services/database.service";
import { User } from "@angular/fire/auth";
import { Option } from "@shared/types/rust/option";
import { Organization } from "../organization/organization.component";
import { toSignal } from "@angular/core/rxjs-interop";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-account",
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    MenuComponent,
    AvatarModule,
    CheckboxModule,
    NgFor,
    NgIf,
    ProgressSpinnerModule,
    ToastModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: "./account.component.html",
  providers: [DialogService],
  styles: ``,
})
export class AccountComponent implements OnDestroy {
  headerTitle: string = "Account";
  ref: DynamicDialogRef | undefined;
  user: Signal<Option<User>>;
  org: Signal<Option<Organization>> = signal(Option.None());

  constructor(
    public auth: AuthService,
    private router: Router,
    private dialogService: DialogService,
    private messageService: MessageService,
    private db: DatabaseService,
  ) {
    this.user = auth.user()
      ? this.db.observe(`auth/users/${auth.user()!.uid}`)
      : signal(Option.None());

    this.org = this.db.observableToSignal<Organization>(this.auth.org$);
  }

  private showSuccess(message: string) {
    this.messageService.add({
      severity: "success",
      summary: message,
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: "error",
      summary: message,
    });
  }

  showResetDialog() {
    this.ref = this.dialogService.open(ResetPasswordDialogComponent, {
      header: "Reset Password",
      width: "25vw",
      height: "auto",
      baseZIndex: 10000,
      contentStyle: { overflow: "visible" },
    });

    this.ref.onClose.subscribe((filter) => {
      if (filter) {
        this.messageService.add({
          severity: "info",
          summary: "Filter Applied",
          detail: `Type: ${filter.type}, Date Range: ${filter.dateRange}`,
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
