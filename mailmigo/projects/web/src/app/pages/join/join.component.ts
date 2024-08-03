import { Component, Signal, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Option } from "@shared/types/rust/option";
import { Organization } from "../organization/organization.component";
import { AuthService } from "@services/auth.service";
import { DatabaseService } from "@services/database.service";
import { NgIf } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { ProgressSpinnerModule } from "primeng/progressspinner";

@Component({
  selector: "app-join",
  standalone: true,
  imports: [NgIf, ButtonModule, ProgressSpinnerModule],
  templateUrl: "./join.component.html",
  styles: ``,
})
export class JoinComponent {
  public org: Signal<Option<Organization>> = signal(Option.None());
  public loading: boolean = false;

  constructor(
    public auth: AuthService,
    private db: DatabaseService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.org = this.db.observe<Organization>(
      `auth/organizations/${this.route.snapshot.params["id"]}`,
    );
  }

  async join() {
    this.loading = true;
    const orgId = this.org().unwrap().id;
    await this.db.set(
      `auth/organizations/${orgId}/members/${this.auth.user()!.uid}`,
      false,
    );
    await this.db.set(`auth/user_orgs/${this.auth.user()!.uid}`, orgId);
    this.router.navigateByUrl("/user/organization");
  }
}
