import { Injectable, inject } from '@angular/core';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  Auth, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup, 
  getAdditionalUserInfo, 
  connectAuthEmulator
} from "@angular/fire/auth";

import { User } from "@shared/types/user"
import environment from '@environments/environment';
import { EnvironmentType } from '@environments/types';
import { Functions, httpsCallable, HttpsCallable, connectFunctionsEmulator  } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private auth: Auth;
  private signup_function: HttpsCallable;

  constructor() {
    this.auth = inject(Auth);
    const functions = inject(Functions);
    if (environment.type == EnvironmentType.LOCAL) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
      connectAuthEmulator(this.auth, "http://127.0.0.1:9099");
    }
    this.signup_function = httpsCallable(functions, 'user');
  }

  private async createUserInRTDB(reqBody: any): Promise<Object> {
    const request = {type: "Create", user: reqBody};
    let ret: Promise<Object> = new Promise((resolve) => resolve({code: 1, message: "Error with creation"}));
    try{
      await this.signup_function(request)
      .then((result) => {
        const data: any = result.data;
        if (data.status >= 300) {
          console.log("Function call unsuccessful, possible error on CF side. Check RTDB");
        } else {
          ret = new Promise((resolve) => resolve({code: 0, message: "Created new user"}));
        }
        })
      }catch (error){
        console.log(error)
        console.error("Function call failed:", error);
        ret = new Promise((reject) => reject({code: 1, message: "Error with creation"}));
      }
    return ret
  }

  async loginWithEmail(userFullName: string, userEmail: string, userPassword: string){
    let userCredential;
    try {
      // Try to sign in the user
      userCredential = await signInWithEmailAndPassword(this.auth, userEmail, userPassword);
      console.log('User signed in:', userCredential.user);
      return new Promise(function(resolve) {
        resolve({code: 0, message: "Signed in"});
      });
    } catch (error) {
      console.log(error)
      if (error instanceof Error){
        if (error.message.includes('auth/user-not-found')) {
          // If user not found, create a new user
          try{
          userCredential = await createUserWithEmailAndPassword(this.auth, userEmail, userPassword);
          console.log('User created:', userCredential.user);
          const user = userCredential.user;
          updateProfile(user, {displayName: userFullName, photoURL: ""});
          const reqBody = {id: user.uid, orgId: "", provider: userCredential.providerId, displayName: userFullName, email: userEmail, pfpURL: "", createdOn: user.metadata.creationTime} as User;
          const ret = await this.createUserInRTDB(reqBody);
          console.log(ret)
          return ret;
          }catch (error){
            console.log(error)
            if (error instanceof Error){
              if (error.message.includes('auth/weak-password')) {
                console.error('Password error:', error);
                return new Promise(function(resolve) {
                  resolve({code: 1, message: "Invalid Password, ensure password has more than six characters"});
                });
              }else{
                return new Promise(function(resolve) {
                  resolve({code: 1, message: "Error signing in"});
                });
              }
            }else{
              return new Promise(function(resolve) {
                resolve({code: 2, message: "Unknown Error Occurred"});
              });
            }
          }
        } else {
          // Handle other errors
          console.error('Error signing in:', error);
          return new Promise(function(resolve) {
            resolve({code: 1, message: "Error signing in"});
          });
        }
      }else{
        return new Promise(function(resolve) {
          resolve({code: 2, message: "Unknown Error Occurred"});
        });
      }
    }
  }

  async loginWithGoogle(){
    const provider = new GoogleAuthProvider();
    let final_ret: any;
    try{
      final_ret = signInWithPopup(this.auth, provider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential === null){
          console.log('Invalid credentials')
          return new Promise(function(resolve) {
            resolve({code: 1, message: "Error signing in"});
          });
          
        }
        
        const user = result.user;
        const userInfo = user.providerData[0];
        if(getAdditionalUserInfo(result)?.isNewUser){
            const reqBody = {id: user.uid, orgId: "", provider: userInfo.providerId, displayName: userInfo.displayName, email: userInfo.email, pfpURL: userInfo.photoURL, createdOn: user.metadata.creationTime} as User;
            const ret = await this.createUserInRTDB(reqBody);
            console.log(ret)
            return ret;
        }
        return new Promise(function(resolve) {
          resolve({code: 0, message: "Signed in"});
        });
      })
      console.log(final_ret)
      return final_ret;
    }catch(error: any){
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Error Code: " + errorCode.toString());
      console.log("Error Message: " + errorMessage.toString());
      return new Promise(function(resolve, reject) {
        reject({code: 1, message: "Error signing in"});
      });
    };
  }
}
