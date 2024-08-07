import { Component, Signal, computed, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import {
  Configuration,
  ConfigurationType,
  LLMType,
  Option,
} from "../../../../../shared/index";
import { ConfigurationsService } from "../../services/configurations.service";
import { NgFor, NgForOf, NgIf } from "@angular/common";
import { DatabaseService } from "../../services/database.service";
import { AuthService } from "../../services/auth.service";
import { map, of, switchMap } from "rxjs";
import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
} from "primeng/dynamicdialog";
import { MessageService } from "primeng/api";
import { EditConfigDialogComponent } from "./components/edit-config-dialog/edit-config-dialog.component";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";

@Component({
  selector: "app-configurations",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    ToastModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
  ],
  templateUrl: "./configurations.component.html",
  styles: ``,
  providers: [DialogService, MessageService],
})
export class ConfigurationsComponent {
  config!: Signal<Configuration | undefined>;
  editing: boolean = false;
  form!: FormGroup;
  llms = Object.values(LLMType);
  diagnostic!: Signal<string>;
  ref: DynamicDialogRef | undefined;

  constructor(
    private auth: AuthService,
    db: DatabaseService,
    public configService: ConfigurationsService,
    public dialogService: DialogService,
    private messageService: MessageService,
  ) {
    if (!auth.user()) return;
    const systemConfig = db.observe<Configuration>("configs/system");
    const orgConfigObs = auth.org$.pipe(
      switchMap((org) =>
        org ? db.observable<Configuration>(`configs/orgs/${org.id}`) : of(null),
      ),
    );
    const orgConfig = db.observableToSignal<Configuration>(orgConfigObs);
    const userConfig = db.observe<Configuration>(
      `configs/users/${auth.user()!.uid}`,
    );
    this.config = computed(() => {
      if (orgConfig()!.isSome() && orgConfig()!.unwrap()) {
        const c = orgConfig()!.unwrap();
        if (
          c!.required ||
          userConfig().isNone() ||
          userConfig().unwrap() == null
        )
          return orgConfig()!.unwrap();
      }
      return userConfig().isSome() && userConfig().unwrap() != null
        ? userConfig().unwrap()
        : systemConfig().isSome()
          ? systemConfig().unwrap()
          : undefined;
    });
  }

  showEditDialog() {
    if (this.config() == undefined) return;
    this.ref = this.dialogService.open(EditConfigDialogComponent, {
      header: "Edit Configuration",
      width: "30vw",
      data: {
        config: this.config(),
        llms: this.llms,
      },
    });

    this.ref.onClose.subscribe((updatedConfig) => {
      if (updatedConfig) {
        updatedConfig["type"] = this.auth.isAdmin
          ? ConfigurationType.ORGANIZATION
          : ConfigurationType.USER;

        if (this.auth.isAdmin)
          this.configService.setOrgConfig(
            updatedConfig,
            this.auth.org$.getValue()!.id,
          );
        else this.configService.setConfig(updatedConfig);
        this.messageService.add({
          severity: "success",
          summary: "Configuration Updated",
          detail: "Your configuration has been successfully updated.",
        });
      }
    });
  }
}
