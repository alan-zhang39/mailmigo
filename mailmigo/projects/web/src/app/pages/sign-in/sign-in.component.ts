import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { NgIf } from "@angular/common";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { LogoComponent } from "@components/logo/logo.component";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-sign-in",
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    ProgressSpinnerModule,
    LogoComponent,
    ToastModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: "./sign-in.component.html",
  styles: ``,
})
export class SignInComponent {
  public message: any = "Waiting for return";
  public isSubmitting: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {}

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

  public loginWithEmail = async (userEmail: string, userPassword: string) => {
    if (this.authService != null && userEmail && userPassword) {
      this.isSubmitting = true;
      const ret: any = await this.authService.signIn(userEmail, userPassword);
      this.message = ret.message;
      if (ret.code > 0) {
        this.showError(this.message);
      } else {
        this.showSuccess(this.message);
        this.router.navigate(["/user/account"]);
      }
      console.log(this.message);
    } else if (userEmail === null && userPassword === null) {
      this.showError("Can't have a null field!");
    }
  };

  public loginWithGoogle = async () => {
    this.isSubmitting = true;
    await this.authService.loginWithGoogle().then((ret) => {
      console.log(ret);
      this.message = ret.message;
      if (ret.code > 0) {
        this.showError(this.message);
      } else {
        this.showSuccess(this.message);
        this.router.navigate(["/user/dashboard"]);
      }
    });
  };
}
