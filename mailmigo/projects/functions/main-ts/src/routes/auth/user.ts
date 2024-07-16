// import { HttpsError, onCall } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
// import { UserProfile } from "*shared/lib/types/user";
// import { getDatabase } from "firebase-admin/database";
//
// const db = getDatabase();

// export const signUpUser = onCall({ cors: true }, (request) => {
//   if (request.data.type === "Create") {
//     return handleSignUpRequest(request.data.user);
//   }
//   return new Promise(function(resolve) {
//     resolve({ status: 400, body: "Invalid request type" });
//   });
// });
//
// async function handleSignUpRequest(data: UserProfile) {
//   const current_time = new Date().toUTCString();
//   const ret = await writeUserData(data, current_time);
//   if (!ret) {
//     logger.error("Error creating user in RTDB.");
//     throw new HttpsError("internal", "Error creating user in RTDB.");
//   }
//   return new Promise(function(resolve) {
//     resolve({ status: 200, body: "User created in RTDB" });
//   });
// }
//
// async function writeUserData(user: UserProfile, current_time: string) {
//   if (user != null) {
//     let orgId = "";
//     if (user.orgId == "") {
//       orgId = "noOrg";
//     }
//     const database_ref = db.ref(`users/${user.id}`);
//     await database_ref.set({
//       userId: user.id,
//       email: user.email,
//       name: user.displayName,
//       orgId: orgId,
//       pfpUrl: user.pfpURL,
//       provider: user.provider,
//       createdOn: current_time,
//       llm: ["Claude"],
//       setting: "default",
//     });
//     return true;
//   } else {
//     logger.info("Error creating user in RTDB.");
//     return false;
//   }
// }
