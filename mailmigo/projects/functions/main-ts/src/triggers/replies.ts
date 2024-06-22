import { onValueCreated } from "firebase-functions/v2/database";
import { getDatabase } from "firebase-admin/database";
import * as logger from "firebase-functions/logger";

import { GmailClient } from "../../lib/gmail/client";

const gmailClient = new GmailClient();
const db = getDatabase();

export const onSummaryUploadSendReply = onValueCreated(
  "demo/generations/summary/{orgId}/{uid}/{documentId}",
  async (event) => {
    const { documentId } = event.params;
    logger.log(`Summary detected for document ${documentId}`);
    try {
      const summaryText = event.data.val();

      const docRef = db.ref(`demo/documents/${documentId}`);
      const doc = await docRef.get();
      const emailId = doc.val().emailId;

      const responseText = `Here is the requested summary:

${summaryText.replace(/([^\n])\n([^\n])/g, "$1 $2")}`;
      await gmailClient.replyToEmailWithText(emailId, responseText);
      return logger.log(
        `Successfully replied with summary for document ${documentId}`,
      );
    } catch (e) {
      return console.log(e);
    }
  },
);
