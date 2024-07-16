import { Component, Signal, computed, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Configuration, LLMType, Option } from "../../../../../shared/index";
import { ConfigurationsService } from "../../services/configurations.service";
import { NgFor, NgForOf, NgIf } from "@angular/common";
import { DatabaseService } from "../../services/database.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-configurations",
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgForOf],
  templateUrl: "./configurations.component.html",
  styles: ``,
})
export class ConfigurationsComponent {
  config: Signal<Option<Configuration>> = signal(Option.None());
  editing: boolean = false;
  form!: Signal<FormGroup>;
  llms = Object.values(LLMType);

  constructor(
    auth: AuthService,
    db: DatabaseService,
    public configService: ConfigurationsService,
  ) {
    console.log(auth.user());
    if (!auth.user()) return;
    const defaultConfig = db.observe<Configuration>("configs/defaults");
    const userConfig = db.observe<Configuration>(
      `configs/users/${auth.user()!.uid}`,
    );
    this.config = computed(() =>
      userConfig().isSome() ? userConfig() : defaultConfig(),
    );
    this.form = computed(
      () =>
        new FormGroup({
          llm: new FormControl(
            this.config().unwrap() != null ? this.config().unwrap().llm : "",
          ),
          prompt: new FormControl(
            this.config().unwrap() != null ? this.config().unwrap().prompt : "",
          ),
        }),
    );
    console.log(this.config());
  }

  startEditing() {
    if (this.config().isNone()) {
      console.log("No config");
      return;
    }
    console.log(this.config().unwrap());
    this.editing = true;
  }

  submit() {
    const submitted = this.form();
    console.log(submitted.value);
    const config: Configuration = {
      llm: submitted.value.llm,
      prompt: submitted.value.prompt,
    };
    this.configService.setConfig(config);
    this.editing = false;
  }

  cancel() {
    this.editing = false;
  }
}
