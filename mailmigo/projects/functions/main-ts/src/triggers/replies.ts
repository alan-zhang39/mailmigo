import { onValueCreated } from "firebase-functions/v2/database";
import { getDatabase } from "firebase-admin/database";
import * as logger from "firebase-functions/logger";

import { GmailClient } from "../../lib/gmail/client";
import { Generation, Task, TaskStatus } from "*shared";
import { getStorage } from "firebase-admin/storage";

const gmailClient = new GmailClient();
const db = getDatabase();
const storage = getStorage();

export const onSummaryUploadSendReply = onValueCreated(
  "generations/summary/{orgId}/{uid}/{documentId}",
  async (event) => {
    const generation: Generation = event.data.val();
    const { orgId, uid, documentId, taskId } = generation;
    db.ref(`tasks/${taskId}/status`).set(TaskStatus.COMPLETE);
    logger.log(`Summary detected for document ${documentId}`);
    try {
      const task: Task = (await db.ref(`tasks/${taskId}`).get()).val();
      const emailId = task.origin?.emailId ?? null;

      if (!emailId) return;

      const genPath = `generations/summary/${orgId}/${uid}/${documentId}.pdf`;
      const bucket = storage.bucket();
      const file = bucket.file(genPath);

      const exists = await file.exists();
      if (!exists) throw Error("Associated generation PDF does not exist");

      const genBytes = Buffer.concat(await file.download());

      await gmailClient.replyToEmailWithFile(emailId, genBytes);
      return logger.log(
        `Successfully replied with summary for document ${documentId}`,
      );
    } catch (e) {
      db.ref(`tasks/${taskId}/status`).set(TaskStatus.FAILED);
      logger.error(e);
    }
  },
);
