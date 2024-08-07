import { applicationDefault, initializeApp } from "firebase-admin/app";
const config = JSON.parse(process.env["FIREBASE_CONFIG"]!);

initializeApp({
  credential: applicationDefault(),
  databaseURL: config.databaseURL,
  storageBucket: config.storageBucket,
});

// Auth
// import { signUpUser } from "./routes/auth/user";

// Gmail
import { onEmailReceived } from "./routes/gmail";
import { onSummaryUploadSendReply } from "./triggers/replies";

// Documents
import { onTaskUploadCreateTranscription } from "./triggers/documents";

// Generations
import { onTranscriptionUploadGenSummary } from "./triggers/summaries";

// exports.signUpUser = signUpUser;
exports.onEmailReceived = onEmailReceived;
exports.onTaskUploadCreateTranscription = onTaskUploadCreateTranscription;
exports.onTranscriptionUploadGenSummary = onTranscriptionUploadGenSummary;
exports.onSummaryUploadSendReply = onSummaryUploadSendReply;
