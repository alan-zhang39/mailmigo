import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";
import { ConfigurationsService } from "../../../../services/configurations.service";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { Configuration, LLMType } from "../../../../../../../shared/index";
import { InputTextareaModule } from "primeng/inputtextarea";
import { CheckboxModule } from "primeng/checkbox";
import { AuthService } from "@services/auth.service";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-edit-config-dialog",
  standalone: true,
  imports: [
    ButtonModule,
    DropdownModule,
    FormsModule,
    InputTextareaModule,
    ReactiveFormsModule,
    CheckboxModule,
    NgIf,
  ],
  providers: [MessageService],
  templateUrl: "./edit-config-dialog.component.html",
})
export class EditConfigDialogComponent {
  form: FormGroup;
  llms: { label: string; value: string }[];
  llm: LLMType;
  required: boolean;

  constructor(
    private ref: DynamicDialogRef,
    private configService: ConfigurationsService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private config: DynamicDialogConfig,
    public auth: AuthService,
  ) {
    // @ts-ignore
    this.llms = this.config.data.llms.map((llm) => ({
      label: llm,
      value: llm,
    }));
    const configData = this.config.data.config;
    this.llm = configData.llm;
    this.required = configData.required ?? false;
    this.form = this.fb.group({
      llm: [configData.llm],
      prompt: [configData.prompt],
      required: [configData.required ?? false],
    });
  }

  submit() {
    if (this.form.valid) {
      const updatedConfig = {
        llm: this.form.value.llm.value ?? this.llm,
        prompt: this.form.value.prompt,
        required: this.form.value.required ?? this.required,
      };
      this.ref.close(updatedConfig);
    } else {
      this.messageService.add({
        severity: "error",
        summary: "Form Error",
        detail: "Please fill out the form correctly.",
      });
    }
  }
}
