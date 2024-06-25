import { OAuth2Client } from "google-auth-library";
import { gmail_v1, google } from "googleapis";
import * as logger from "firebase-functions/logger";

export class GmailClient {
  oAuth: OAuth2Client;
  gmail: gmail_v1.Gmail;

  constructor() {
    // Check for env vals
    if (process.env["OAUTH_CREDENTIAL"] === undefined) {
      throw new Error("Missing OAuth Credential");
    } else if (process.env["OAUTH_TOKEN"] === undefined) {
      throw new Error("Missing OAuth Token");
    }

    const credential = JSON.parse(process.env["OAUTH_CREDENTIAL"]);
    const token = JSON.parse(process.env["OAUTH_TOKEN"]);

    const {
      client_secret: clientSecret,
      client_id: clientId,
      redirect_uris: redirectUris,
    } = credential.installed;

    this.oAuth = new google.auth.OAuth2(clientId, clientSecret, redirectUris);
    this.oAuth.setCredentials(token);
    this.gmail = google.gmail({ version: "v1", auth: this.oAuth });
  }

  public async getMessageIdByHistoryId(historyId: string) {
    try {
      const historyRes = await this.gmail.users.history.list({
        userId: "me",
        startHistoryId: historyId,
      });
      const history = historyRes.data.history;
      if (!history) {
        throw Error("Failed to fetch history, no history");
      }
      const messages = history[history.length - 1].messagesAdded;
      if (!messages) throw Error("Failed to fetch history, no messages");
      const messageId = messages[messages.length - 1].message?.id;
      if (!messageId) throw Error("Failed to fetch history, no message id");
      return messageId;
    } catch (e) {
      const errorMsg = `Failed to get email with historyId: ${historyId}`;
      logger.error(errorMsg);
      logger.error(e);
      throw new Error(errorMsg);
    }
  }

  public async getMessageById(messageId: string) {
    try {
      const message = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
      });
      return message.data;
    } catch (e) {
      const errorMsg = `Failed to get email with messageId: ${messageId}`;
      logger.error(errorMsg);
      logger.error(e);
      throw new Error(errorMsg);
    }
  }

  public async getMessageAttachments(message: gmail_v1.Schema$Message) {
    if (!message.id) throw Error("No message id");
    else if (message.payload === undefined) throw Error("No payload");
    else if (message.payload.parts === undefined) {
      console.log(message.payload);
      throw Error("No payload parts");
    }

    const attachmentIds: string[] = message.payload.parts
      .filter((part) => part.mimeType === "application/pdf")
      .map((part) => part.body!.attachmentId!)
      .filter((id) => id !== null && id !== undefined);
    try {
      const attachmentPromises = attachmentIds.map((id: string) => {
        if (!message.id) throw Error("Invalid ID");
        return this.getAttachmentById(message.id, id);
      });
      return Promise.all(attachmentPromises);
    } catch (e) {
      const errorMsg = `Failed to get attachments of messageId: ${message.id}`;
      logger.error(errorMsg);
      logger.error(e);
      throw new Error(errorMsg);
    }
  }

  private async getAttachmentById(messageId: string, attachmentId: string) {
    try {
      const attachment = await this.gmail.users.messages.attachments.get({
        userId: "me",
        messageId,
        id: attachmentId,
      });
      return attachment.data;
    } catch (e) {
      const errorMsg = `Failed to get attachment with: messageId: ${messageId}, attachmentId: ${attachmentId}`;
      logger.error(errorMsg);
      logger.error(e);
      throw new Error(errorMsg);
    }
  }

  public async replyToEmailWithText(messageId: string, text: string) {
    const message = await this.getMessageById(messageId);
    const threadId = message.threadId;
    const fromHeader = message.payload!.headers!.find(
      (header) => header.name === "From",
    );
    const subjectHeader = message.payload!.headers!.find(
      (header) => header.name === "Subject",
    );

    if (!fromHeader) {
      console.error('Unable to find the "From" header in the message.');
      return;
    }

    // Create the email response
    const fromEmail = fromHeader.value;
    const subject = subjectHeader ? subjectHeader.value : "Re:";
    const rawMessage = [
      "To: " + fromEmail,
      "Subject: Re: " + subject,
      "In-Reply-To: " + messageId,
      "References: " + messageId,
      "",
      text,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    try {
      const res = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
          threadId: threadId,
        },
      });
      console.log("Message sent:", res.data);
      return res;
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  }
}
