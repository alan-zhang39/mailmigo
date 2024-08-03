import { Component, Signal, signal } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { DatabaseService } from "../../services/database.service";
import { Option } from "@shared/types/rust/option";
import { CommonModule, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";

export interface Organization {
  id: string;
  name: string;
  members: {
    [id: string]: boolean;
  };
}

@Component({
  selector: "app-organization",
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    CommonModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ToastModule,
  ],
  templateUrl: "./organization.component.html",
  styles: ``,
})
export class OrganizationComponent {
  public org: Option<Organization | null> = Option.None();
  public inviteUrl: string = "";
  public formActive: boolean = false;
  public orgName = "";

  constructor(
    public auth: AuthService,
    private db: DatabaseService,
    private messageService: MessageService,
  ) {
    this.auth.org$.subscribe((org) => {
      this.org = org == undefined ? Option.None() : Option.Some(org);
      this.inviteUrl = org
        ? `${window.location.origin}/user/join/${org.id}`
        : "";
    });
  }

  count(obj: Object) {
    return Object.keys(obj).length;
  }

  async createOrg() {
    const id = await this.db.push("auth/organizations", {
      name: this.orgName,
      members: {
        [this.auth.user()!.uid]: true,
      },
    });
    if (!id) return;
    await this.db.set(`auth/user_orgs/${this.auth.user()!.uid}`, id);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.inviteUrl).then(
      () => {
        this.messageService.add({
          severity: "success",
          summary: "Copied!",
          detail: "Invite link copied to clipboard.",
        });
      },
      (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to copy invite link.",
        });
      },
    );
  }
}
