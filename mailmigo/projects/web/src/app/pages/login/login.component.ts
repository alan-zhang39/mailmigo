import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LogoComponent } from '@components/logo/logo.component'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgIf, ProgressSpinnerModule, LogoComponent],
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent {
   public message : any = "Waiting for return";
   public isSubmitting : boolean = false;

    constructor(private authService: AuthService, private toastr: ToastrService) {
      console.log("Working")
    }
    
    public showSuccess(message: string) {
      this.toastr.success(message);
    }

    public showError(message: string) {
      this.toastr.error(message);
    }

    public loginWithEmail = async (userFullName: string, userEmail: string, userPassword: string) => {
      console.log("Got called to Auth Service")
      if (this.authService != null && userFullName && userEmail && userPassword){
        this.isSubmitting = true;
        console.log("Sending to Auth Service")
        const ret: any = await this.authService.loginWithEmail(userFullName, userEmail, userPassword);
        this.message = ret.message;
        if (ret.code > 0){
          this.showError(this.message);
        }else{
          this.showSuccess(this.message);
        }
        console.log(this.message);
      } else if (userFullName === null && userEmail === null && userPassword === null){
        this.showError("Can't have a null field!");
      }
    }

    public loginWithGoogle = async () => {
      this.isSubmitting = true;
      await this.authService.loginWithGoogle()
      .then((ret) => {
        console.log(ret)
        this.message = ret.message;
        if (ret.code > 0){
          this.showError(this.message);
        }else{
          this.showSuccess(this.message);
        }
      })
    }
}
