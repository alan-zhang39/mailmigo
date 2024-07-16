import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GmailClient } from "../../../lib/gmail/client";
import { getStorage } from "firebase-admin/storage";
import { getDatabase } from "firebase-admin/database";
import { Document } from "*shared/lib/types/document";
import { gmail_v1 } from "googleapis";
import "dotenv/config";
import { getAuth } from "firebase-admin/auth";
import { GenerationType, Task, TaskStatus } from "*shared";
// import { processPdf } from "../../index";

const gmailClient = new GmailClient();

const storage = getStorage();
const db = getDatabase();
const auth = getAuth();

export const onEmailReceived = onRequest(async (req, res) => {
  logger.info("Email received");
  try {
    const tmp = Buffer.from(req.body.message.data, "base64url").toString();
    const data = JSON.parse(tmp);

    const historyRef = db.ref("historyId");

    const historyId = (await historyRef.get()).val().toString();
    const newHistoryId = data.historyId.toString();

    const messageId = await gmailClient.getMessageIdByHistoryId(historyId);
    const message = await gmailClient.getMessageById(messageId);
    const attachments = await gmailClient.getMessageAttachments(message);

    const decodedAttachments = attachments
      .filter(
        (attachment) =>
          attachment.data !== null && attachment.data !== undefined,
      )
      .map((attachment) => Buffer.from(attachment.data!, "base64url"));

    const bucket = storage.bucket();

    const headers = convertHeaderArrayToObj(message.payload!.headers!);
    const authorEmail = getFrom(headers["From"]);

    const author = await auth.getUserByEmail(authorEmail);
    const orgId = "all";

    decodedAttachments.forEach(async (decoded) => {
      let taskId = null;
      try {
        // Create document
        const path = `documents/${orgId}/${author.uid}`;
        const ref = db.ref(path).push();
        if (!ref.key) throw Error("Failed to create doc ref");
        await bucket.file(`${path}/${ref.key}.pdf`).save(decoded);
        const doc: Document = {
          id: ref.key,
          uid: author.uid,
          orgId,
          timestamp: Date.now(),
          filename: ref.key, // change to actual filename
        };
        ref.set(doc);

        // Create task
        const taskRef = db.ref(`tasks`).push();
        taskId = taskRef.key;
        if (!taskId) throw Error("Failed to create task ref");
        taskRef.set(<Task>{
          id: taskId,
          type: GenerationType.SUMMARY,
          status: TaskStatus.UPLOADING,
          documentId: ref.key,
          uid: author.uid,
          orgId,
          origin: {
            threadId: message.threadId,
            from: headers["From"],
            to: headers["To"],
            emailId: messageId,
          },
          timestamp: Date.now(),
        });
      } catch {
        if (taskId) db.ref(`tasks/${taskId}/status`).set(TaskStatus.FAILED);
      }
    });

    historyRef.set(newHistoryId);
    logger.info(`Uploaded ${decodedAttachments.length} detected attachment(s)`);
  } catch (e) {
    logger.error(e);
  } finally {
    res.sendStatus(200);
  }
});

const convertHeaderArrayToObj = (
  headerArr: gmail_v1.Schema$MessagePartHeader[],
): { [key: string]: any } => {
  return headerArr.reduce(
    (acc, curr) => {
      if (curr.name && curr.value) acc[curr.name] = curr.value;
      return acc;
    },
    <{ [key: string]: any }>{},
  );
};

const getFrom = (header: string) => {
  if (header) {
    const emailMatch = header.match(/<(.+)>/);
    if (emailMatch && emailMatch[1]) {
      return emailMatch[1];
    } else {
      return header; // In case the email is not enclosed in <>
    }
  } else {
    throw new Error("From header not found");
  }
};
