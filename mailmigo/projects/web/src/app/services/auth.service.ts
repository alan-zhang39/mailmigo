import {
  Injectable,
  OnDestroy,
  OnInit,
  Signal,
  computed,
  inject,
  signal,
} from "@angular/core";
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
  user,
  User,
  onAuthStateChanged,
  Unsubscribe,
  NextOrObserver,
  UserInfo,
  signOut,
} from "@angular/fire/auth";

import environment from "@environments/environment";
import { EnvironmentType } from "@environments/types";
import { Functions, connectFunctionsEmulator } from "@angular/fire/functions";
import { toSignal } from "@angular/core/rxjs-interop";
import { DatabaseService } from "./database.service";
import {
  BehaviorSubject,
  Observable,
  Subscription,
  map,
  switchMap,
} from "rxjs";
import { Router } from "@angular/router";
import { Organization } from "../pages/organization/organization.component";

@Injectable({
  providedIn: "root",
})
export class AuthService implements OnDestroy {
  private user_sub: Unsubscribe;
  public user: Signal<User | null | undefined>;
  public user$: Observable<User | null | undefined>;
  public org$: BehaviorSubject<Organization | null | undefined> =
    new BehaviorSubject<Organization | null | undefined>(undefined);
  public orgSub: Subscription | null = null;
  public isAdmin: boolean = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private db: DatabaseService,
    functions: Functions,
  ) {
    if (!environment.firebaseConfig.authDomain)
      throw Error("No authdomain provided");
    if (environment.type == EnvironmentType.LOCAL) {
      connectFunctionsEmulator(functions, "http://127.0.0.1", 5001);
      connectAuthEmulator(auth, environment.firebaseConfig.authDomain);
    }
    this.user = toSignal(user(auth));
    this.user$ = user(auth);
    this.user_sub = onAuthStateChanged(
      auth,
      this.onAuthChange as NextOrObserver<User | null>,
    );
  }

  onAuthChange = (user: User | null) => {
    this.updateUserData(user);
    console.log("auth changed", user);
    if (this.orgSub) {
      this.orgSub.unsubscribe();
      this.orgSub = null;
    }
    if (user)
      this.orgSub = this.db
        .observable<string>(`auth/user_orgs/${user.uid}`)
        .pipe(
          switchMap((orgId) =>
            this.db.observable<Organization>(`auth/organizations/${orgId}`),
          ),
        )
        .subscribe((org) => {
          this.org$.next(org);
          if (!org) this.isAdmin = false;
          else this.isAdmin = org.members[user.uid];
          console.log(`admin: ${this.isAdmin}`);
        });
  };

  updateUserData = (user: User | null) => {
    if (user === null) return;
    console.log("Data changed");
    const userInfo: UserInfo = {
      displayName: user.displayName,
      uid: user.uid,
      photoURL: user.photoURL,
      email: user.email,
      phoneNumber: user.phoneNumber,
      providerId: user.providerId,
    };
    this.db.update(`auth/users/${user.uid}`, userInfo);
  };

  async signUp(name: string, email: string, password: string) {
    try {
      const user = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );
      updateProfile(user.user, { displayName: name });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("auth/weak-password")
      ) {
        return {
          code: 1,
          message: "Error: Please choose a stronger password",
        };
      }
      return {
        code: 1,
        message: "Error: Failed to create account",
      };
    }
    return {
      code: 0,
      message: "Signed up",
    };
  }

  async signIn(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("auth/user-not-found")
      ) {
        return { code: 1, message: "Incorrect email or password" };
      }
      return { code: 1, message: "Error signing in" };
    }
    return { code: 0, message: "Signed in" };
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
    } catch {
      return { code: 1, message: "Error signing in" };
    }
    return { code: 0, message: "Signed in" };
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigateByUrl("/sign-in");
    } catch (e) {
      console.log(e);
      console.log("Logout failed");
    }
  }

  public async changeCurrentUserPass(newPassword: string) {
    console.log(this.user()?.providerId);
    // const currentUser = this.auth.currentUser;
    // if (currentUser == null) {
    //   return { code: 0, message: "No user signed in" };
    // }
    // let ret = { code: 0, message: "Updated Password" };
    // try {
    //   await updatePassword(currentUser, newPassword);
    // } catch (error: any) {
    //   ret = { code: 2, message: "Unknown Error" };
    //   console.log(error.message);
    //   if (
    //     error instanceof Error &&
    //     error.message.includes("auth/weak-password")
    //   ) {
    //     console.error("Password error:", error);
    //     ret = {
    //       code: 1,
    //       message:
    //         "Invalid Password, ensure password has more than six characters",
    //     };
    //   }
    // }
    // return ret;
  }

  ngOnDestroy(): void {
    this.user_sub();
  }
}
