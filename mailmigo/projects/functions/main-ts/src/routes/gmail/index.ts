import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GmailClient } from "../../../lib/gmail/client";
import { getStorage } from "firebase-admin/storage";
import { getDatabase } from "firebase-admin/database";
import { DocumentProgress } from "*shared";
import { gmail_v1 } from "googleapis";
// import { processPdf } from "../../index";

const gmailClient = new GmailClient();

const storage = getStorage();
const db = getDatabase();

export const onEmailReceived = onRequest(async (req, res) => {
  logger.info("Email received");
  try {
    const tmp = Buffer.from(req.body.message.data, "base64url").toString();
    const data = JSON.parse(tmp);

    const historyRef = db.ref("demo/historyId");

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

    decodedAttachments.forEach((decoded) => {
      const ref = db.ref("demo/documents").push();
      ref.set({
        status: DocumentProgress.UPLOADING,
        documentId: ref.key,
        threadId: message.threadId,
        from: headers["From"],
        to: headers["To"],
        emailId: messageId,
      });
      bucket.file(`${ref.key}.pdf`).save(decoded);
      // processPdf(bucket, decoded);
    });

    historyRef.set(newHistoryId);
    logger.info(`Uploaded ${decodedAttachments.length} detected attachment(s)`);
  } catch (e) {
    console.log(e);
    res.sendStatus(200);
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
