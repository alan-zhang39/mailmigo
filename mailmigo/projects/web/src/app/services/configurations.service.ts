import { Injectable, Signal, computed, signal } from "@angular/core";
import { DatabaseService } from "./database.service";
import { AuthService } from "./auth.service";
import { Configuration } from "@shared/types/configuration";
import { Option } from "@shared/types/rust/option";

@Injectable({
  providedIn: "root",
})
export class ConfigurationsService {
  config: Signal<Option<Configuration>> = signal(Option.None());

  constructor(
    private auth: AuthService,
    private db: DatabaseService,
  ) {
    auth.user$.subscribe((user) => {
      if (!user) {
        this.config = signal(Option.None());
        return;
      }
    });
  }

  setConfig(config: Configuration) {
    if (!this.auth.user()) return;
    this.db.set(`configs/users/${this.auth.user()?.uid}`, config);
  }

  setOrgConfig(config: Configuration, org: string) {
    if (!this.auth.user()) return;
    this.db.set(`configs/orgs/${org}`, config);
  }
}
